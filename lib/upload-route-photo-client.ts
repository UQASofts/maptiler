function buildPhotoPathname(file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  return `route-photos/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
}

function isLocalDev(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

async function uploadViaFormData(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch("/api/upload/route-photo", {
    method: "POST",
    body: formData,
  });

  const payload = (await response.json().catch(() => ({}))) as {
    url?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Failed to upload image.");
  }

  if (!payload.url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }

  return payload.url;
}

async function uploadViaVercelBlob(file: File): Promise<string> {
  const { upload } = await import("@vercel/blob/client");
  const blob = await upload(buildPhotoPathname(file), file, {
    access: "public",
    handleUploadUrl: "/api/upload/route-photo",
  });
  return blob.url;
}

export async function uploadRoutePhotoFromBrowser(file: File): Promise<string> {
  if (isLocalDev()) {
    return uploadViaFormData(file);
  }

  return uploadViaVercelBlob(file);
}
