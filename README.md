# MAIL Dashboard

A personal control panel and dashboard for managing the Master of Arts in Artificial Intelligence Leadership (MAIL) program at the University of St. Thomas.

## Live Application

**Production URL**: https://mail-dashboard-if3qtfj7zq-uc.a.run.app/

## Features

- **Task Management** - Drag-and-drop task panel with status tracking (Not Started → In Progress → Launched)
- **Course Tracking** - Faculty-to-course matrix with 10 checkpoints per course and progress visualization
- **Timeline View** - Visual course pipeline grouped by academic year with checkpoint reminders
- **Files Browser** - Google Drive integration for browsing program documents
- **Marketing Tab** - Editable contacts list for video series planning
- **Assessment Tab** - SLOs, ULAC deadlines, HLC requirements tracking
- **Budget Tab** - Revenue, enrollment, and expense tracking
- **Search** - Unified search across tasks, courses, contacts, and files

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5 (Google OAuth)
- **Data Storage**: Google Sheets API
- **File Storage**: Google Drive API
- **Deployment**: Google Cloud Run
- **CI/CD**: GitHub Actions

## Getting Started

### Prerequisites

- Node.js 20+
- Google Cloud project with:
  - Google Sheets API enabled
  - Google Drive API enabled
  - OAuth 2.0 credentials configured

### Environment Variables

Create a `.env.local` file:

```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret
GOOGLE_SHEET_ID=your-google-sheet-id
GOOGLE_DRIVE_FOLDER_ID=your-drive-folder-id
```

### Installation

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The application automatically deploys to Google Cloud Run on push to `main` branch via GitHub Actions.

### Required GitHub Secrets

- `GCP_SA_KEY` - Google Cloud service account JSON key
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID` - OAuth client ID
- `GOOGLE_CLIENT_SECRET` - OAuth client secret
- `GOOGLE_SHEET_ID` - Google Sheet ID for data storage
- `GOOGLE_DRIVE_FOLDER_ID` - Google Drive folder ID

## Project Structure

```
dashboard/
├── src/
│   ├── app/
│   │   ├── api/           # API routes (auth, tasks, courses, contacts, drive, search)
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── layout/        # Header, TaskPanel, TabContainer
│   │   └── tabs/          # CoursesTab, FilesTab, MarketingTab, AssessmentTab, BudgetTab, TimelineView
│   ├── hooks/             # useTasks, useCourses, useContacts, useSearch
│   ├── lib/               # sheets.ts, drive.ts
│   └── auth.ts
├── Dockerfile
├── .github/workflows/deploy.yml
└── package.json
```

## License

Private - University of St. Thomas
