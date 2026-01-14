import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCourses, saveCourses, ensureCoursesSheet, CourseRow } from "@/lib/sheets";

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 });
  }

  try {
    await ensureCoursesSheet(session.accessToken, sheetId);
    const courses = await getCourses(session.accessToken, sheetId);
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) {
    return NextResponse.json({ error: "Sheet ID not configured" }, { status: 500 });
  }

  try {
    const courses: CourseRow[] = await request.json();
    await saveCourses(session.accessToken, sheetId, courses);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving courses:", error);
    return NextResponse.json({ error: "Failed to save courses" }, { status: 500 });
  }
}
