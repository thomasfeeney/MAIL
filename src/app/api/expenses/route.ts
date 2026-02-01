import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getExpenses, saveExpenses, ensureExpensesSheet, ExpenseRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureExpensesSheet(session.accessToken, SHEET_ID);
    const expenses = await getExpenses(session.accessToken, SHEET_ID);
    return NextResponse.json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
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
    const expenses: ExpenseRow[] = await request.json();
    await ensureExpensesSheet(session.accessToken, SHEET_ID);
    await saveExpenses(session.accessToken, SHEET_ID, expenses);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving expenses:", error);
    return NextResponse.json(
      { error: "Failed to save expenses" },
      { status: 500 }
    );
  }
}
