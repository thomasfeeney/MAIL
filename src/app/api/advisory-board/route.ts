import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getAdvisoryBoard, saveAdvisoryBoard, ensureAdvisoryBoardSheet, AdvisoryBoardRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureAdvisoryBoardSheet(session.accessToken, SHEET_ID);
    const members = await getAdvisoryBoard(session.accessToken, SHEET_ID);
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching advisory board:", error);
    return NextResponse.json(
      { error: "Failed to fetch advisory board" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const members: AdvisoryBoardRow[] = await request.json();
    await ensureAdvisoryBoardSheet(session.accessToken, SHEET_ID);
    await saveAdvisoryBoard(session.accessToken, SHEET_ID, members);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving advisory board:", error);
    return NextResponse.json(
      { error: "Failed to save advisory board" },
      { status: 500 }
    );
  }
}
