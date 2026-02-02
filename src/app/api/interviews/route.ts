import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getInterviews, saveInterviews, ensureInterviewsSheet, InterviewRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureInterviewsSheet(session.accessToken, SHEET_ID);
    const interviews = await getInterviews(session.accessToken, SHEET_ID);
    return NextResponse.json(interviews);
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch interviews" },
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
    const interviews: InterviewRow[] = await request.json();
    await ensureInterviewsSheet(session.accessToken, SHEET_ID);
    await saveInterviews(session.accessToken, SHEET_ID, interviews);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving interviews:", error);
    return NextResponse.json(
      { error: "Failed to save interviews" },
      { status: 500 }
    );
  }
}
