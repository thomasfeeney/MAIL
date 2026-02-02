import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTasks, getCourses, getContacts, getBudgetItems, getInterviews } from "@/lib/sheets";
import { searchFiles } from "@/lib/drive";

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;

export interface SearchResult {
  id: string;
  type: "task" | "course" | "contact" | "file" | "budget" | "interview";
  title: string;
  subtitle?: string;
  url?: string;
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const searchTerm = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  try {
    // Search in parallel
    const [tasks, courses, contacts, files, budgetItems, interviews] = await Promise.all([
      getTasks(session.accessToken, SHEET_ID).catch(() => []),
      getCourses(session.accessToken, SHEET_ID).catch(() => []),
      getContacts(session.accessToken, SHEET_ID).catch(() => []),
      searchFiles(session.accessToken, query, 5).catch(() => []),
      getBudgetItems(session.accessToken, SHEET_ID).catch(() => []),
      getInterviews(session.accessToken, SHEET_ID).catch(() => []),
    ]);

    // Search tasks
    tasks.forEach((task) => {
      if (
        task.title.toLowerCase().includes(searchTerm) ||
        task.notes?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: `task-${task.id}`,
          type: "task",
          title: task.title,
          subtitle: task.status === "in_progress" ? "In Progress" : task.status === "launched" ? "Launched" : "Not Started",
        });
      }
    });

    // Search courses
    courses.forEach((course) => {
      const courseName = course.name || "";
      const courseCode = course.code || "";
      const faculty = course.faculty || "";

      if (
        courseCode.toLowerCase().includes(searchTerm) ||
        courseName.toLowerCase().includes(searchTerm) ||
        faculty.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: `course-${course.id}`,
          type: "course",
          title: `${courseCode}: ${courseName}`,
          subtitle: `${course.term} - ${faculty}`,
        });
      }
    });

    // Search contacts
    contacts.forEach((contact) => {
      if (
        contact.name?.toLowerCase().includes(searchTerm) ||
        contact.role?.toLowerCase().includes(searchTerm) ||
        contact.email?.toLowerCase().includes(searchTerm) ||
        contact.notes?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: `contact-${contact.id}`,
          type: "contact",
          title: contact.name,
          subtitle: contact.role,
        });
      }
    });

    // Search budget fiscal years
    budgetItems.forEach((item) => {
      if (
        item.fiscalYear?.toLowerCase().includes(searchTerm) ||
        item.notes?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: `budget-${item.id}`,
          type: "budget",
          title: item.fiscalYear,
          subtitle: item.notes || "Budget",
        });
      }
    });

    // Search interviews
    interviews.forEach((interview) => {
      if (
        interview.guestName?.toLowerCase().includes(searchTerm) ||
        interview.guestOrganization?.toLowerCase().includes(searchTerm) ||
        interview.guestTitle?.toLowerCase().includes(searchTerm) ||
        interview.notes?.toLowerCase().includes(searchTerm)
      ) {
        results.push({
          id: `interview-${interview.id}`,
          type: "interview",
          title: interview.guestName || "Unnamed Guest",
          subtitle: [interview.guestTitle, interview.guestOrganization].filter(Boolean).join(" · ") || interview.status,
        });
      }
    });

    // Add file results
    files.forEach((file) => {
      results.push({
        id: `file-${file.id}`,
        type: "file",
        title: file.name,
        subtitle: file.mimeType.includes("folder") ? "Folder" : "File",
        url: file.webViewLink || undefined,
      });
    });

    return NextResponse.json({ results: results.slice(0, 20) });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
