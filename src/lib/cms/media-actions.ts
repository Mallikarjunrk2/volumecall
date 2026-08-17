"use server";

import { requireAdmin } from "./auth";
import { createMediaRecord, deleteMediaRecord, getMediaById } from "./media-service";
import { put, del } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

/**
 * Sanitizes a filename to prevent directory traversal and injection.
 */
function sanitizeFilename(originalName: string): string {
  // Strip paths
  const base = originalName.replace(/^.*[\\/]/, "");
  // Replace disallowed characters with hyphens
  const cleaned = base
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");
  return cleaned || "image.webp";
}

export interface UploadMediaResult {
  success: boolean;
  url?: string;
  filename?: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  error?: string;
}

/**
 * Server Action: Uploads an image file to Vercel Blob and records metadata in Neon.
 * Strictly protected with requireAdmin().
 */
export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  const admin = await requireAdmin();

  const file = formData.get("file") as File | null;
  const altText = (formData.get("altText") as string | null)?.trim() || null;

  if (!file || typeof file === "string" || file.size === 0) {
    return { success: false, error: "No image file provided." };
  }

  // 1. Validate File Size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of 4 MB.`,
    };
  }

  // 2. Validate MIME Type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: `Unsupported file type (${file.type || "unknown"}). Only JPEG, PNG, WebP, and AVIF images are permitted.`,
    };
  }

  // 3. Generate Safe Pathname
  const safeName = sanitizeFilename(file.name);
  const uniquePrefix = crypto.randomUUID();
  const storagePathname = `articles/${uniquePrefix}-${safeName}`;

  let blobUrl = "";
  try {
    // 4. Upload to Vercel Blob
    const blob = await put(storagePathname, file, {
      access: "public",
      contentType: file.type,
      addRandomSuffix: false,
    });
    blobUrl = blob.url;

    // 5. Store Metadata in Neon PostgreSQL
    await createMediaRecord({
      filename: `${uniquePrefix}-${safeName}`,
      original_filename: file.name.slice(0, 250),
      url: blob.url,
      alt_text: altText,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: admin.email,
    });

    return {
      success: true,
      url: blob.url,
      filename: safeName,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    };
  } catch (error) {
    console.error("[Media Upload Error]:", error);

    // Rollback: If DB insert fails after blob upload, cleanup orphaned blob
    if (blobUrl) {
      try {
        await del(blobUrl);
      } catch (delErr) {
        console.error("[Media Rollback Error]:", delErr);
      }
    }

    const message = error instanceof Error ? error.message : "Failed to upload image.";
    // Don't expose token or sensitive internal stack traces
    if (message.includes("BLOB_READ_WRITE_TOKEN")) {
      return {
        success: false,
        error: "Blob storage token is not configured. Please set BLOB_READ_WRITE_TOKEN in .env.local / Vercel.",
      };
    }

    return {
      success: false,
      error: "An error occurred while uploading the image. Please try again.",
    };
  }
}

/**
 * Server Action: Deletes a media asset from Neon and Vercel Blob.
 * Strictly protected with requireAdmin().
 */
export async function deleteMediaAction(id: string): Promise<{ success: boolean; error?: string }> {
  await requireAdmin();

  try {
    const record = await getMediaById(id);
    if (record) {
      if (record.url.includes("vercel-storage.com") || record.url.includes("blob.vercel-storage.com")) {
        try {
          await del(record.url);
        } catch (blobErr) {
          console.error("[Blob Deletion Warning]:", blobErr);
        }
      }
      await deleteMediaRecord(id);
    }
    return { success: true };
  } catch (error) {
    console.error("[Delete Media Action Error]:", error);
    return { success: false, error: "Failed to delete media asset." };
  }
}
