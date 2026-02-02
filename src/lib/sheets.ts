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

// Budget functions
export interface BudgetRow {
  id: string;
  fiscalYear: string;
  tuitionPerCredit: number;
  totalEnrollment: number;
  ustFacultyStaff: number;
  scholarshipAllotted: number;
  discretionary: number;
  notes: string;
}

const BUDGET_RANGE = "Budget!A:H";

export async function getBudgetItems(accessToken: string, sheetId: string): Promise<BudgetRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: BUDGET_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `budget-${index}`,
    fiscalYear: row[1] || "",
    tuitionPerCredit: parseFloat(row[2]) || 0,
    totalEnrollment: parseInt(row[3]) || 0,
    ustFacultyStaff: parseInt(row[4]) || 0,
    scholarshipAllotted: parseFloat(row[5]) || 0,
    discretionary: parseFloat(row[6]) || 0,
    notes: row[7] || "",
  }));
}

export async function saveBudgetItems(accessToken: string, sheetId: string, items: BudgetRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "fiscalYear", "tuitionPerCredit", "totalEnrollment", "ustFacultyStaff", "scholarshipAllotted", "discretionary", "notes"],
    ...items.map((item) => [
      item.id,
      item.fiscalYear,
      item.tuitionPerCredit.toString(),
      item.totalEnrollment.toString(),
      item.ustFacultyStaff.toString(),
      item.scholarshipAllotted.toString(),
      item.discretionary.toString(),
      item.notes || "",
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: BUDGET_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: BUDGET_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureBudgetSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const budgetSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Budget"
    );

    if (!budgetSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Budget" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Budget!A1:H1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "fiscalYear", "tuitionPerCredit", "totalEnrollment", "ustFacultyStaff", "scholarshipAllotted", "discretionary", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Budget sheet:", error);
    throw error;
  }
}

// Enrollment functions
export interface EnrollmentRow {
  id: string;
  fiscalYear: string;
  term: string;
  tuitionPaying: number;
  onBenefits: number;
  nonDegree: number;
  electiveSeekers: number;
}

const ENROLLMENT_RANGE = "Enrollment!A:G";

export async function getEnrollment(accessToken: string, sheetId: string): Promise<EnrollmentRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: ENROLLMENT_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `enrollment-${index}`,
    fiscalYear: row[1] || "",
    term: row[2] || "",
    tuitionPaying: parseInt(row[3]) || 0,
    onBenefits: parseInt(row[4]) || 0,
    nonDegree: parseInt(row[5]) || 0,
    electiveSeekers: parseInt(row[6]) || 0,
  }));
}

export async function saveEnrollment(accessToken: string, sheetId: string, rows: EnrollmentRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "fiscalYear", "term", "tuitionPaying", "onBenefits", "nonDegree", "electiveSeekers"],
    ...rows.map((r) => [
      r.id,
      r.fiscalYear,
      r.term,
      r.tuitionPaying.toString(),
      r.onBenefits.toString(),
      r.nonDegree.toString(),
      r.electiveSeekers.toString(),
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: ENROLLMENT_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: ENROLLMENT_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureEnrollmentSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const enrollmentSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Enrollment"
    );

    if (!enrollmentSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Enrollment" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Enrollment!A1:G1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "fiscalYear", "term", "tuitionPaying", "onBenefits", "nonDegree", "electiveSeekers"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Enrollment sheet:", error);
    throw error;
  }
}

// Scholarship functions
export interface ScholarshipRow {
  id: string;
  fiscalYear: string;
  studentName: string;
  term: string;
  credits: number;
  perCreditDiscount: number;
  notes: string;
}

const SCHOLARSHIPS_RANGE = "Scholarships!A:G";

export async function getScholarships(accessToken: string, sheetId: string): Promise<ScholarshipRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: SCHOLARSHIPS_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `scholarship-${index}`,
    fiscalYear: row[1] || "",
    studentName: row[2] || "",
    term: row[3] || "",
    credits: parseFloat(row[4]) || 0,
    perCreditDiscount: parseFloat(row[5]) || 0,
    notes: row[6] || "",
  }));
}

export async function saveScholarships(accessToken: string, sheetId: string, scholarships: ScholarshipRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "fiscalYear", "studentName", "term", "credits", "perCreditDiscount", "notes"],
    ...scholarships.map((s) => [
      s.id,
      s.fiscalYear,
      s.studentName,
      s.term,
      s.credits.toString(),
      s.perCreditDiscount.toString(),
      s.notes || "",
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: SCHOLARSHIPS_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: SCHOLARSHIPS_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureScholarshipsSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const scholarshipsSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Scholarships"
    );

    if (!scholarshipsSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Scholarships" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Scholarships!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "fiscalYear", "studentName", "term", "credits", "perCreditDiscount", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Scholarships sheet:", error);
    throw error;
  }
}

// Expenses functions
export interface ExpenseRow {
  id: string;
  fiscalYear: string;
  description: string;
  amount: number;
  notes: string;
}

const EXPENSES_RANGE = "Expenses!A:E";

export async function getExpenses(accessToken: string, sheetId: string): Promise<ExpenseRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: EXPENSES_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `expense-${index}`,
    fiscalYear: row[1] || "",
    description: row[2] || "",
    amount: parseFloat(row[3]) || 0,
    notes: row[4] || "",
  }));
}

export async function saveExpenses(accessToken: string, sheetId: string, expenses: ExpenseRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "fiscalYear", "description", "amount", "notes"],
    ...expenses.map((e) => [
      e.id,
      e.fiscalYear,
      e.description,
      e.amount.toString(),
      e.notes || "",
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: EXPENSES_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: EXPENSES_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureExpensesSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const expensesSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Expenses"
    );

    if (!expensesSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Expenses" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Expenses!A1:E1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "fiscalYear", "description", "amount", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Expenses sheet:", error);
    throw error;
  }
}

// Advisory Board functions
export interface AdvisoryBoardRow {
  id: string;
  name: string;
  email: string;
  organization: string;
  dateAdded: string;
  notes: string;
}

const ADVISORY_BOARD_RANGE = "AdvisoryBoard!A:F";

export async function getAdvisoryBoard(accessToken: string, sheetId: string): Promise<AdvisoryBoardRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: ADVISORY_BOARD_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `board-${index}`,
    name: row[1] || "",
    email: row[2] || "",
    organization: row[3] || "",
    dateAdded: row[4] || "",
    notes: row[5] || "",
  }));
}

export async function saveAdvisoryBoard(accessToken: string, sheetId: string, members: AdvisoryBoardRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "name", "email", "organization", "dateAdded", "notes"],
    ...members.map((m) => [
      m.id,
      m.name,
      m.email,
      m.organization,
      m.dateAdded,
      m.notes || "",
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: ADVISORY_BOARD_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: ADVISORY_BOARD_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureAdvisoryBoardSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const boardSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "AdvisoryBoard"
    );

    if (!boardSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "AdvisoryBoard" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "AdvisoryBoard!A1:F1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "name", "email", "organization", "dateAdded", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring AdvisoryBoard sheet:", error);
    throw error;
  }
}

// Interview functions
export interface InterviewRow {
  id: string;
  guestName: string;
  guestTitle: string;
  guestOrganization: string;
  guestEmail: string;
  guestLinkedIn: string;
  status: 'prospect' | 'contacted' | 'booked' | 'recorded' | 'editing' | 'published';
  notes: string;
  scheduledDate: string;
  recordedDate: string;
  publishedDate: string;
  publishedUrl: string;
  referredBy: string;
}

const INTERVIEWS_RANGE = "Interviews!A:M";

export async function getInterviews(accessToken: string, sheetId: string): Promise<InterviewRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: INTERVIEWS_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row, index) => ({
    id: row[0] || `interview-${index}`,
    guestName: row[1] || "",
    guestTitle: row[2] || "",
    guestOrganization: row[3] || "",
    guestEmail: row[4] || "",
    guestLinkedIn: row[5] || "",
    status: (row[6] as InterviewRow["status"]) || "prospect",
    notes: row[7] || "",
    scheduledDate: row[8] || "",
    recordedDate: row[9] || "",
    publishedDate: row[10] || "",
    publishedUrl: row[11] || "",
    referredBy: row[12] || "",
  }));
}

export async function saveInterviews(accessToken: string, sheetId: string, interviews: InterviewRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["id", "guestName", "guestTitle", "guestOrganization", "guestEmail", "guestLinkedIn", "status", "notes", "scheduledDate", "recordedDate", "publishedDate", "publishedUrl", "referredBy"],
    ...interviews.map((i) => [
      i.id,
      i.guestName,
      i.guestTitle,
      i.guestOrganization,
      i.guestEmail,
      i.guestLinkedIn,
      i.status,
      i.notes || "",
      i.scheduledDate || "",
      i.recordedDate || "",
      i.publishedDate || "",
      i.publishedUrl || "",
      i.referredBy || "",
    ]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: INTERVIEWS_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: INTERVIEWS_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureInterviewsSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const interviewsSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "Interviews"
    );

    if (!interviewsSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "Interviews" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "Interviews!A1:M1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["id", "guestName", "guestTitle", "guestOrganization", "guestEmail", "guestLinkedIn", "status", "notes", "scheduledDate", "recordedDate", "publishedDate", "publishedUrl", "referredBy"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring Interviews sheet:", error);
    throw error;
  }
}

// Interview Stage Notes functions
export interface StageNoteRow {
  stage: string;
  notes: string;
}

const STAGE_NOTES_RANGE = "InterviewStageNotes!A:B";

export async function getStageNotes(accessToken: string, sheetId: string): Promise<StageNoteRow[]> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: STAGE_NOTES_RANGE,
  });

  const rows = response.data.values || [];
  if (rows.length <= 1) return [];

  return rows.slice(1).map((row) => ({
    stage: row[0] || "",
    notes: row[1] || "",
  }));
}

export async function saveStageNotes(accessToken: string, sheetId: string, stageNotes: StageNoteRow[]): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  const values = [
    ["stage", "notes"],
    ...stageNotes.map((sn) => [sn.stage, sn.notes]),
  ];

  await sheets.spreadsheets.values.clear({
    spreadsheetId: sheetId,
    range: STAGE_NOTES_RANGE,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: sheetId,
    range: STAGE_NOTES_RANGE,
    valueInputOption: "RAW",
    requestBody: { values },
  });
}

export async function ensureStageNotesSheet(accessToken: string, sheetId: string): Promise<void> {
  const sheets = await getGoogleSheetsClient(accessToken);

  try {
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: sheetId,
    });

    const stageNotesSheet = spreadsheet.data.sheets?.find(
      (s) => s.properties?.title === "InterviewStageNotes"
    );

    if (!stageNotesSheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: { title: "InterviewStageNotes" },
              },
            },
          ],
        },
      });

      await sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: "InterviewStageNotes!A1:B1",
        valueInputOption: "RAW",
        requestBody: {
          values: [["stage", "notes"]],
        },
      });
    }
  } catch (error) {
    console.error("Error ensuring InterviewStageNotes sheet:", error);
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
