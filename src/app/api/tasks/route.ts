import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasks, saveTasks, ensureTasksSheet, TaskRow } from "@/lib/sheets";

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
    await ensureTasksSheet(session.accessToken, sheetId);
    const tasks = await getTasks(session.accessToken, sheetId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
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
    const tasks: TaskRow[] = await request.json();
    await saveTasks(session.accessToken, sheetId, tasks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving tasks:", error);
    return NextResponse.json({ error: "Failed to save tasks" }, { status: 500 });
  }
}
