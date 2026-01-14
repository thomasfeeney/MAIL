import { google } from "googleapis";

export async function getGoogleSheetsClient(accessToken: string) {
  const auth = new google.auth.OAuth2();
  auth.setCredentials({ access_token: accessToken });
  return google.sheets({ version: "v4", auth });
}

export interface TaskRow {
  id: string;
  title: string;
  status: "not_started" | "in_progress" | "launched";
  notes: string;
  link: string;
  order: number;
}

export interface CourseRow {
  id: string;
  code: string;
  name: string;
  term: string;
  faculty: string;
  facultyConfirmed: boolean;
  checkpoints: string; // JSON string of checkpoint booleans
}

const TASKS_RANGE = "Tasks!A:F";

export async function getTasks(accessToken: string, sheetId: string): Promise<TaskRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: TASKS_RANGE,
  });

  const rows = response.data.values || [];

  // Skip header row
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `task-${index}`,
    title: row[1] || "",
    status: (row[2] as TaskRow["status"]) || "not_started",
    notes: row[3] || "",
    link: row[4] || "",
    order: parseInt(row[5]) || index,
  })).sort((a, b) => a.order - b.order);
}

export async function saveTasks(accessToken: string, sheetId: string, tasks: TaskRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  // Prepare data with header
  const values = [
    ["id", "title", "status", "notes", "link", "order"],
    ...tasks.map((task, index) => [
      task.id,
      task.title,
      task.status,
      task.notes || "",
      task.link || "",
      index.toString(),
    ]),
  ];

  // Clear existing data and write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: TASKS_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: TASKS_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureTasksSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    // Check if Tasks sheet exists
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const tasksSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Tasks"
    );

    if (!tasksSheet) {
      // Create Tasks sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Tasks" },
              },
            },
          ],
        },
      });

      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Tasks!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "title", "status", "notes", "link", "order"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Tasks sheet:", error);
    throw error;
  }
}

// Courses functions
const COURSES_RANGE = "Courses!A:G";

export async function getCourses(accessToken: string, sheetId: string): Promise<CourseRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: COURSES_RANGE,
  });

  const rows = response.data.values || [];

  // Skip header row
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `course-${index}`,
    code: row[1] || "",
    name: row[2] || "",
    term: row[3] || "",
    faculty: row[4] || "",
    facultyConfirmed: row[5] === "true",
    checkpoints: row[6] || "{}",
  }));
}

export async function saveCourses(accessToken: string, sheetId: string, courses: CourseRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  // Prepare data with header
  const values = [
    ["id", "code", "name", "term", "faculty", "facultyConfirmed", "checkpoints"],
    ...courses.map((course) => [
      course.id,
      course.code,
      course.name,
      course.term,
      course.faculty,
      course.facultyConfirmed.toString(),
      course.checkpoints,
    ]),
  ];

  // Clear existing data and write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: COURSES_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: COURSES_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

// Contacts functions
export interface ContactRow {
  id: string;
  name: string;
  role: string;
  email: string;
  notes: string;
}

const CONTACTS_RANGE = "Contacts!A:E";

export async function getContacts(accessToken: string, sheetId: string): Promise<ContactRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: CONTACTS_RANGE,
  });

  const rows = response.data.values || [];

  // Skip header row
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `contact-${index}`,
    name: row[1] || "",
    role: row[2] || "",
    email: row[3] || "",
    notes: row[4] || "",
  }));
}

export async function saveContacts(accessToken: string, sheetId: string, contacts: ContactRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  // Prepare data with header
  const values = [
    ["id", "name", "role", "email", "notes"],
    ...contacts.map((contact) => [
      contact.id,
      contact.name,
      contact.role,
      contact.email,
      contact.notes || "",
    ]),
  ];

  // Clear existing data and write new data
  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: CONTACTS_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: CONTACTS_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureContactsSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const contactsSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Contacts"
    );

    if (!contactsSheet) {
      // Create Contacts sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Contacts" },
              },
            },
          ],
        },
      });

      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Contacts!A1:E1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "name", "role", "email", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Contacts sheet:", error);
    throw error;
  }
}

export async function ensureCoursesSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const coursesSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Courses"
    );

    if (!coursesSheet) {
      // Create Courses sheet
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Courses" },
              },
            },
          ],
        },
      });

      // Add header row
      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Courses!A1:G1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "code", "name", "term", "faculty", "facultyConfirmed", "checkpoints"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Courses sheet:", error);
    throw error;
  }
}
