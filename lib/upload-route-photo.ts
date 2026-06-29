import { put } from "@vercel/blob";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function resolveContentType(file: File): string {
  if (file.type && ALLOWED_TYPES.has(file.type)) {
    return file.type;
  }

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXT_TO_MIME[ext] ?? "";
}

function buildFilename(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  return `route-photos/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
}

async function uploadToLocalDisk(
  filename: string,
  buffer: Buffer,
): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");

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
    addRandomSuffix: true,
  });
  return blob.url;
}

function isRunningOnVercel(): boolean {
  return process.env.VERCEL === "1";
}

function hasBlobStorageConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      isRunningOnVercel(),
  );
}

export async function saveRoutePhoto(file: File): Promise<string> {
  const contentType = resolveContentType(file);
  if (!contentType) {
    throw new Error("Only JPEG, PNG, WebP, and GIF images are allowed.");
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error("Image must be 10 MB or smaller.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = buildFilename(file.name);

  if (isRunningOnVercel()) {
    if (!hasBlobStorageConfigured()) {
      throw new Error(
        "Image upload is not configured. Add a Vercel Blob store to this project.",
      );
    }

    try {
      return await uploadToVercelBlob(filename, buffer, contentType);
    } catch (error) {
      console.error("[saveRoutePhoto] Vercel Blob upload failed:", error);
      throw new Error(
        error instanceof Error
          ? error.message
          : "Image upload failed on Vercel Blob.",
      );
    }
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      return await uploadToVercelBlob(filename, buffer, contentType);
    } catch (error) {
      console.warn(
        "[saveRoutePhoto] Blob upload failed, falling back to local disk:",
        error,
      );
    }
  }

  return uploadToLocalDisk(filename, buffer);
}
