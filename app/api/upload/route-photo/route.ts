import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { saveRoutePhoto } from "@/lib/upload-route-photo";

export const runtime = "nodejs";

const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as HandleUploadBody;
      const jsonResponse = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ALLOWED_CONTENT_TYPES,
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true,
        }),
      });
      return NextResponse.json(jsonResponse);
    } catch (error) {
      console.error("[api/upload/route-photo] client upload failed:", error);
      return NextResponse.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "Image upload failed. Connect a Vercel Blob store to this project.",
        },
        { status: 400 },
      );
    }
  }

  try {
    const formData = await request.formData();
    const file = formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const url = await saveRoutePhoto(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[api/upload/route-photo] form upload failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 },
    );
  }
}
