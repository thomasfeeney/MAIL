import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getContacts, saveContacts, ensureContactsSheet, ContactRow } from "@/lib/sheets";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export async function GET() {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureContactsSheet(session.accessToken, SHEET_ID);
    const contacts = await getContacts(session.accessToken, SHEET_ID);
    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
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
    const contacts: ContactRow[] = await request.json();
    await ensureContactsSheet(session.accessToken, SHEET_ID);
    await saveContacts(session.accessToken, SHEET_ID, contacts);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving contacts:", error);
    return NextResponse.json(
      { error: "Failed to save contacts" },
      { status: 500 }
    );
  }
}
