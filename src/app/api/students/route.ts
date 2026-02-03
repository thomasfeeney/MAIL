import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getStudents, saveStudents, ensureStudentsSheet, StudentRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureStudentsSheet(session.accessToken, SHEET_ID);
    const students = await getStudents(session.accessToken, SHEET_ID);
    return NextResponse.json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
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
    const students: StudentRow[] = await request.json();
    await ensureStudentsSheet(session.accessToken, SHEET_ID);
    await saveStudents(session.accessToken, SHEET_ID, students);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving students:", error);
    return NextResponse.json(
      { error: "Failed to save students" },
      { status: 500 }
    );
  }
}
