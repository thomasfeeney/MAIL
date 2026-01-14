import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { listFiles, searchFiles } from "@/lib/drive";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const folderId = searchParams.get("folderId") || process.env.GOOGLE_DRIVE_FOLDER_ID;
  const query = searchParams.get("q");
  const pageToken = searchParams.get("pageToken");

  try {
    if (query) {
      // Search mode
      const files = await searchFiles(session.accessToken, query);
      return NextResponse.json({ files });
    } else {
      // Browse mode
      const result = await listFiles(
        session.accessToken,
        folderId || undefined,
        pageToken || undefined
      );
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Drive API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
