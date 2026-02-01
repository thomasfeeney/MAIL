import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getBudgetItems, saveBudgetItems, ensureBudgetSheet, BudgetRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureBudgetSheet(session.accessToken, SHEET_ID);
    const items = await getBudgetItems(session.accessToken, SHEET_ID);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
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
    const items: BudgetRow[] = await request.json();
    await ensureBudgetSheet(session.accessToken, SHEET_ID);
    await saveBudgetItems(session.accessToken, SHEET_ID, items);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving budget:", error);
    return NextResponse.json(
      { error: "Failed to save budget" },
      { status: 500 }
    );
  }
}
