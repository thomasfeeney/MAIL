import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getEnrollment, saveEnrollment, ensureEnrollmentSheet, EnrollmentRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureEnrollmentSheet(session.accessToken, SHEET_ID);
    const rows = await getEnrollment(session.accessToken, SHEET_ID);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return NextResponse.json(
      { error: "Failed to fetch enrollment" },
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
    const rows: EnrollmentRow[] = await request.json();
    await ensureEnrollmentSheet(session.accessToken, SHEET_ID);
    await saveEnrollment(session.accessToken, SHEET_ID, rows);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving enrollment:", error);
    return NextResponse.json(
      { error: "Failed to save enrollment" },
      { status: 500 }
    );
  }
}
