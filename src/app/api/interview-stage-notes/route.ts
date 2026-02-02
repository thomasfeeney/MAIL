import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStageNotes, saveStageNotes, ensureStageNotesSheet, StageNoteRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureStageNotesSheet(session.accessToken, SHEET_ID);
    const notes = await getStageNotes(session.accessToken, SHEET_ID);
    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching stage notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch stage notes" },
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
    const notes: StageNoteRow[] = await request.json();
    await ensureStageNotesSheet(session.accessToken, SHEET_ID);
    await saveStageNotes(session.accessToken, SHEET_ID, notes);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving stage notes:", error);
    return NextResponse.json(
      { error: "Failed to save stage notes" },
      { status: 500 }
    );
  }
}
