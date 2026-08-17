import "server-only";
import { sql } from "@/lib/db";
import { ensureCmsTables } from "./db-init";
import { MediaInput, MediaRecord } from "./types";

async function checkInit() {
  await ensureCmsTables();
}

/**
 * Creates a new media metadata record in Neon PostgreSQL.
 */
export async function createMediaRecord(input: MediaInput): Promise<MediaRecord> {
  await checkInit();
  const rows = await sql`
    INSERT INTO media (
      filename, original_filename, url, alt_text, mime_type,
      size_bytes, width, height, uploaded_by, created_at
    ) VALUES (
      ${input.filename}, ${input.original_filename}, ${input.url},
      ${input.alt_text || null}, ${input.mime_type}, ${input.size_bytes},
      ${input.width || null}, ${input.height || null}, ${input.uploaded_by || null}, NOW()
    )
    RETURNING *;
  `;
  return rows[0] as MediaRecord;
}

/**
 * Retrieves a single media record by its ID.
 */
export async function getMediaById(id: string): Promise<MediaRecord | null> {
  await checkInit();
  try {
    const rows = await sql`SELECT * FROM media WHERE id = ${id} LIMIT 1;`;
    return (rows[0] as MediaRecord) || null;
  } catch (error) {
    console.error(`[getMediaById Error] for ID ${id}:`, error);
    return null;
  }
}

/**
 * Retrieves a single media record by its URL.
 */
export async function getMediaByUrl(url: string): Promise<MediaRecord | null> {
  await checkInit();
  try {
    const rows = await sql`SELECT * FROM media WHERE url = ${url} LIMIT 1;`;
    return (rows[0] as MediaRecord) || null;
  } catch (error) {
    console.error(`[getMediaByUrl Error] for URL ${url}:`, error);
    return null;
  }
}

/**
 * Lists the most recent media records for the admin portal.
 */
export async function listMediaRecords(limit = 50): Promise<MediaRecord[]> {
  await checkInit();
  try {
    const rows = await sql`
      SELECT * FROM media
      ORDER BY created_at DESC
      LIMIT ${limit};
    `;
    return rows as MediaRecord[];
  } catch (error) {
    console.error("[listMediaRecords Error]:", error);
    return [];
  }
}

/**
 * Deletes a media metadata record by ID.
 */
export async function deleteMediaRecord(id: string): Promise<void> {
  await checkInit();
  await sql`DELETE FROM media WHERE id = ${id};`;
}
