import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getScholarships, saveScholarships, ensureScholarshipsSheet, ScholarshipRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureScholarshipsSheet(session.accessToken, SHEET_ID);
    const scholarships = await getScholarships(session.accessToken, SHEET_ID);
    return NextResponse.json(scholarships);
  } catch (error) {
    console.error("Error fetching scholarships:", error);
    return NextResponse.json(
      { error: "Failed to fetch scholarships" },
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
    const scholarships: ScholarshipRow[] = await request.json();
    await ensureScholarshipsSheet(session.accessToken, SHEET_ID);
    await saveScholarships(session.accessToken, SHEET_ID, scholarships);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving scholarships:", error);
    return NextResponse.json(
      { error: "Failed to save scholarships" },
      { status: 500 }
    );
  }
}
