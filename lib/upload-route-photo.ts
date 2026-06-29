import fs from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function buildFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `route-photos/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
}

async function uploadToLocalDisk(
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const localName = path.basename(filename);
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, localName), buffer);
  return `/uploads/${localName}`;
}

async function uploadToVercelBlob(
  filename: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return blob.url;
}

export async function saveRoutePhoto(file: File): Promise<string> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = buildFilename(file.name);
  const useBlob =
    Boolean(process.env.BLOB_READ_WRITE_TOKEN) || process.env.VERCEL === "1";

  if (useBlob) {
    try {
      return await uploadToVercelBlob(filename, buffer, file.type);
    } catch (error) {
      if (process.env.VERCEL === "1") {
        console.error("[uploadRoutePhoto] Vercel Blob upload failed:", error);
        throw new Error(
          "Image upload failed. Link a Vercel Blob store to this project and redeploy.",
        );
      }
      console.warn(
        "[uploadRoutePhoto] Blob upload failed, falling back to local disk:",
        error,
      );
    }
  }

  return uploadToLocalDisk(filename, buffer);
}
