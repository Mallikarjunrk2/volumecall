"use server";

import { getCurrentCmsUser } from "./auth";
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
  const base = originalName.replace(/^.*[\\/]/, "");
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
 * Strictly protected with CMS user authentication check.
 */
export async function uploadMediaAction(formData: FormData): Promise<UploadMediaResult> {
  try {
    // 1. Authenticate CMS User safely without unhandled redirect exceptions
    const user = await getCurrentCmsUser();
    if (!user || !user.is_active) {
      return {
        success: false,
        error: "Unauthorized: Active CMS session required to upload media. Please sign in.",
      };
    }

    // 2. Validate Storage Token Availability
    const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
    if (!blobToken) {
      console.error("[Media Upload Error]: BLOB_READ_WRITE_TOKEN environment variable is missing.");
      return {
        success: false,
        error: "Storage configuration error: BLOB_READ_WRITE_TOKEN is not configured.",
      };
    }

    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string | null)?.trim() || null;

    if (!file || typeof file === "string" || file.size === 0) {
      return { success: false, error: "No image file provided." };
    }

    // 3. Validate File Size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return {
        success: false,
        error: `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of 4 MB.`,
      };
    }

    // 4. Validate MIME Type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return {
        success: false,
        error: `Unsupported file type (${file.type || "unknown"}). Only JPEG, PNG, WebP, and AVIF images are permitted.`,
      };
    }

    // 5. Generate Safe Pathname
    const safeName = sanitizeFilename(file.name);
    const uniquePrefix = crypto.randomUUID();
    const storagePathname = `articles/${uniquePrefix}-${safeName}`;

    // 6. Convert file to buffer for robust stream handling across serverless runtimes
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 7. Upload to Vercel Blob
    let blobUrl = "";
    try {
      const blob = await put(storagePathname, buffer, {
        access: "public",
        contentType: file.type,
        addRandomSuffix: false,
        token: blobToken,
      });
      blobUrl = blob.url;
    } catch (blobErr) {
      console.error("[Vercel Blob Upload Error]:", blobErr);
      const msg = blobErr instanceof Error ? blobErr.message : "Blob storage upload failed.";
      return {
        success: false,
        error: `Failed to upload to storage: ${msg}`,
      };
    }

    // 8. Store Metadata in Neon PostgreSQL
    try {
      await createMediaRecord({
        filename: `${uniquePrefix}-${safeName}`,
        original_filename: file.name.slice(0, 250),
        url: blobUrl,
        alt_text: altText,
        mime_type: file.type,
        size_bytes: file.size,
        uploaded_by: user.email,
      });
    } catch (dbErr) {
      console.error("[Media Database Record Error]:", dbErr);
      // Clean up orphaned blob if database insert fails
      if (blobUrl) {
        try {
          await del(blobUrl, { token: blobToken });
        } catch (delErr) {
          console.error("[Media Rollback Error]:", delErr);
        }
      }
      return {
        success: false,
        error: "Image was uploaded but failed to save database record. Please try again.",
      };
    }

    return {
      success: true,
      url: blobUrl,
      filename: safeName,
      originalFilename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    };
  } catch (error) {
    console.error("[Unhandled Media Upload Error]:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred during upload.";
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Server Action: Deletes a media asset from Neon and Vercel Blob.
 */
export async function deleteMediaAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentCmsUser();
    if (!user || !user.is_active) {
      return { success: false, error: "Unauthorized: Active CMS session required." };
    }

    const record = await getMediaById(id);
    if (record) {
      if (record.url.includes("vercel-storage.com") || record.url.includes("blob.vercel-storage.com")) {
        try {
          await del(record.url, { token: process.env.BLOB_READ_WRITE_TOKEN });
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
