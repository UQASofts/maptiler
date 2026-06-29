import { NextResponse } from "next/server";

import { saveRoutePhoto } from "@/lib/upload-route-photo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const url = await saveRoutePhoto(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error("[api/upload/route-photo]", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload image.",
      },
      { status: 500 },
    );
  }
}
