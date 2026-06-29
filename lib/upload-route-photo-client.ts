export async function uploadRoutePhotoFromBrowser(file: File): Promise<string> {
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
    throw new Error(
      payload.error ??
        "Failed to upload image. Add a Vercel Blob store in your project settings.",
    );
  }

  if (!payload.url) {
    throw new Error("Upload succeeded but no image URL was returned.");
  }

  return payload.url;
}
