"use client";

import { useState, useEffect, useCallback } from "react";

export interface Task {
  id: string;
  title: string;
  status: "not_started" | "in_progress" | "launched";
  notes?: string;
  link?: string;
}

// Default tasks from Roadmap and Notes.docx
// Order: Not Started (top) → In Progress → Launched (bottom, oldest)
const defaultTasks: Task[] = [
  // === NOT STARTED (newest, top) ===
  {
    id: "task-ns-1",
    title: "ULAC Assessment Reflection",
    status: "not_started",
    notes: `DUE October 2026.

• Hold 1+ discussion(s) with MAIL faculty using ULAC Reflection Guide (in Assessment folder)
• Focus: Is our assessment plan meaningful AND sustainable?
• Existing SLOs:
  - Understand the principles and long-term trends that explain AI
  - Integrate AI ethically with a broad range of human concerns
  - Lead AI projects of genuine and enduring value
• Plan: Assess one SLO per year on 3-year rotation, starting Spring 2027
• Assessors: Program Director + 2 Advisory Board volunteers
• Artifact: Portfolio pieces from graduating students
• Summarize discussion(s) in 1 paragraph for 2025-2026 annual academic unit report (due Oct 2026)
• Contact: Tonia Bock (tsbock@stthomas.edu) for consultation`,
  },
  {
    id: "task-ns-2",
    title: "Funding",
    status: "not_started",
    notes: `NVIDIA and other tech companies need to follow Carnegie strategy – win public support by funding ethical adoption. Could this provide assistance for UST?`,
  },
  {
    id: "task-ns-3",
    title: "International Students",
    status: "not_started",
    notes: `Grant: International Students – Proposal for Alley: Tony Blair, Africa, Costa Rica?

FIRST CONTACT SHOULD BE JOHAN HARVARD VIA LINKEDIN`,
  },
  {
    id: "task-ns-4",
    title: "Survey Competition, Form Strategy",
    status: "not_started",
    notes: `Students finding info through ChatGPT, which guides them to us and to Purdue.`,
  },
  {
    id: "task-ns-5",
    title: "MAIL Advisory Board",
    status: "not_started",
    notes: `• Composed of faculty who have taught at least one MAIL course
• Functions: Assessment review (2 volunteers per year), curriculum coordination, program feedback
• Needed by: Spring 2027 (before first SLO assessment)`,
  },

  // === IN PROGRESS ===
  {
    id: "task-ip-1",
    title: "Build \"Learning Wheel\" in Student Hub",
    status: "in_progress",
    notes: `Purpose is to map and manage course overlap, help students handle lack of shared background and varied course sequence.

Hub = Prof edited, shared Glossary/Resource List
• Hub Request = What do you want students to know already when starting your course?
• Hub Contribution = What would expect them to know after completing your course?
• Do Contributions Cover Requests? If not, change curriculum.

Spokes = topics and learning goals for each course

Rim = Project Portfolio`,
  },
  {
    id: "task-ip-2",
    title: "Informational Interview Planning",
    status: "in_progress",
    notes: `Invite Dan McGuire to give a talk.
Paul Omodt, Wisconsin Consultants…`,
  },

  // === LAUNCHED (oldest at very bottom) ===
  {
    id: "task-l-29",
    title: "Spring Classroom Visits or Pizza Event",
    status: "launched",
    notes: `IDEAS FROM ERIC:

A few CISC courses that stood out to me as possibilities: CIS 490 w/ Priscilla Pazmino, CISC 489 w/ Mark Salisbury, CISC 440 w/ Pakeeza Akram, and CISC 419 w/ Kristian Mortensen. Any of those possible?

For other CAS UG courses, here's a few that I thought of: JPST 355 w/ Obasesam Okoi, LABM 333 w/ Olga Herrera, PHIL 350 w/ Michael Winter, PHIL 365 w/ you, PHIL 380 w/ Michael Winter, and POLS 404 w/ Timothy Lynch.`,
  },
  {
    id: "task-l-28",
    title: "AI Experiments",
    status: "launched",
    notes: `Eddy's Idea: Use MAIL as a lab for AI adoptions…virtual tutors, virtual TAs??`,
  },
  {
    id: "task-l-27",
    title: "Student Poster Board on Canvas?",
    status: "launched",
    notes: `Padlet`,
  },
  {
    id: "task-l-26",
    title: "Build Courses",
    status: "launched",
    notes: `See Courses tab for detailed tracking.`,
  },
  {
    id: "task-l-25",
    title: "AI Access Instructions in Student Hub",
    status: "launched",
    notes: `Students have been informed about the 1 year free at Google. 9/24/25: Still waiting on Google package deal from Jena and Anne`,
  },
  {
    id: "task-l-24",
    title: "Info Sessions",
    status: "launched",
    notes: `Session Frequency:
• 1 per month except
• January – 2
• March/April – 3
• August – 2
• October/November - 3

Session Timing:
Mostly Noon but sometimes 6pm. For international, 8am.`,
  },
  {
    id: "task-l-23",
    title: "Opening Announcement!!",
    status: "launched",
    notes: ``,
  },
  {
    id: "task-l-22",
    title: "Welcome Fall Students",
    status: "launched",
    notes: `Meet and Greet for August`,
  },
  {
    id: "task-l-21",
    title: "MOU",
    status: "launched",
    notes: `2 courses, summer. Get clear on Summer 2025?`,
  },
  {
    id: "task-l-20",
    title: "Build Portfolio instruction in Student Hub",
    status: "launched",
    notes: `The portfolio will be built up from final projects. This requires a few steps:
• Make sure final projects are open and relevant enough
• After Peter thinks a little more about his final project, bring in Jihun, then every prof thereafter
• Establish a stable storage place that endures for the students from course to course – likely just OneDrive.

GIVE PETER COPY FOR UPLOAD INSTRUCTIONS. HAPPENS AFTER LAST ASSIGNMENT: 'ONE MORE THING TO START YOUR PORTFOLIO…'`,
  },
  {
    id: "task-l-19",
    title: "Charter and Assessment Plan",
    status: "launched",
    notes: `Kim Vrudny. Sarah Smith (Accreditation and Assessment) needs learning outcomes to satisfy HLC accreditation requirements.`,
  },
  {
    id: "task-l-18",
    title: "Acceptance Workflow",
    status: "launched",
    notes: `Due July 1.
Suzanne with Jo Montie on student welcome hub. Aside from welcome and orientation, should foster rolling community.`,
  },
  {
    id: "task-l-17",
    title: "Handbook",
    status: "launched",
    notes: `Kim Vrudny.`,
    link: "https://simplebooklet.com/casgraduatestudenthandbookandcoursecatalog#page=41",
  },
  {
    id: "task-l-16",
    title: "Admissions Workflow",
    status: "launched",
    notes: `Alley is point. She will draft admissions and denial letters. Scholarship decisions made prior to sending admission letter. Weekly meeting to decide on admissions. Information on new offers/acceptances goes to Roxanne K, who communicates with Chad Nosebush via spreadsheet (?).`,
  },
  {
    id: "task-l-15",
    title: "Marketing",
    status: "launched",
    notes: `• Krista Palmquist (Communication Operations)
• Eric Wilkinson (Recruitment)
• Carlee Hackl (Communication Content Lead)
• Bailey Richardson (Communications Content Writer)
• Adam Brunner (website)
• Lisa Klein (Lead, Marketing)

Marketing builds awareness so people enter the long funnel.`,
  },
  {
    id: "task-l-14",
    title: "Build Application Portal",
    status: "launched",
    notes: `Keturah`,
  },
  {
    id: "task-l-13",
    title: "Build Website",
    status: "launched",
    notes: `Adam Brunner`,
  },
  {
    id: "task-l-12",
    title: "Get approval at program level",
    status: "launched",
    notes: `"Once this process is completed, we'll work with Tonia to get MOHE approval. We also need to determine whether HLC" -Alley`,
  },
  {
    id: "task-l-11",
    title: "Internal Approval Process",
    status: "launched",
    notes: `"CASCC approval, CAS consent period, university-wide comment period, GCC approval. It's hard to tell how long that whole process will take, but it's likely around 3 months from the time you launch it." -Alley`,
  },
  {
    id: "task-l-10",
    title: "Submit to Curriculog as a package",
    status: "launched",
    notes: `DUE by 6am 11/23.
Proposal + Courses, Each Course Individually (I do all of this, copy/paste). Make sure proposal course descriptions match individual syllabi – after submitting aligning them will require an "information item."`,
  },
  {
    id: "task-l-9",
    title: "Get syllabi, answers to curriculog questions from each faculty member",
    status: "launched",
    notes: `Committees approve course descriptions and question answers – not syllabi. The syllabus is just for illustration, not binding. Only needs to show flow, details pending. Goal is 7 weeks of intellectual excitement, fire, 1 week final project.`,
  },
  {
    id: "task-l-8",
    title: "Corral Faculty to give \"I'm In\" emails",
    status: "launched",
    notes: `Email should express commitment to develop a specific course, understanding of AIL's mission.`,
  },
  {
    id: "task-l-7",
    title: "Contact Deans and Chairs",
    status: "launched",
    notes: `Permission, parameters for approaching faculty. Don't break things. Specifically, Dean level letter saying they support faculty teaching for MAIL. Also, tell them about CAS overload option.

ENG: Besser says write to Rege cc-ing her – obstacle is staffing (and hence pay) – permission to ask CS.`,
  },
  {
    id: "task-l-6",
    title: "Conferences",
    status: "launched",
    notes: `Mark Price: Yes.`,
  },
  {
    id: "task-l-5",
    title: "Get commitment to program launch for final list of 10 courses from Eddie, Bill",
    status: "launched",
    notes: `Remember, this commits UST to the about 50K cost of launch. Subsequent years are profit.`,
  },
  {
    id: "task-l-4",
    title: "SPEED Team",
    status: "launched",
    notes: `Hannah Mikels, Alley Benton`,
  },
  {
    id: "task-l-3",
    title: "Submit Proposal for Market Research",
    status: "launched",
    notes: `Communicate aims for market research to ??`,
  },
  {
    id: "task-l-2",
    title: "Edit",
    status: "launched",
    notes: `Take into account email feedback, need for minimal prerequisites.`,
  },
  {
    id: "task-l-1",
    title: "Export to Word",
    status: "launched",
    notes: `Word Doc with rationale, student learning objectives, course descriptions.`,
  },
];

interface UseTasksResult {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  isLoading: boolean;
  error: string | null;
  save: () => Promise<void>;
  isSaving: boolean;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasksState] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[] | null>(null);

  // Load tasks on mount
  useEffect(() => {
    async function loadTasks() {
      try {
        const response = await fetch("/api/tasks");
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            // No tasks in sheet yet, use defaults and save them
            setTasksState(defaultTasks);
            setPendingTasks(defaultTasks);
          } else {
            setTasksState(data);
          }
        } else if (response.status === 500) {
          // Sheet might not be configured yet
          const data = await response.json();
          if (data.error === "Sheet ID not configured") {
            setError("Google Sheet not configured. Please add GOOGLE_SHEET_ID to .env.local");
          } else {
            setError("Failed to load tasks");
          }
        }
      } catch (err) {
        setError("Failed to load tasks");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadTasks();
  }, []);

  // Update tasks and queue save
  const setTasks = useCallback((newTasks: Task[]) => {
    setTasksState(newTasks);
    setPendingTasks(newTasks);
  }, []);

  // Save tasks
  const save = useCallback(async () => {
    if (!pendingTasks) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          pendingTasks.map((t, i) => ({
            ...t,
            notes: t.notes || "",
            link: t.link || "",
            order: i,
          }))
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingTasks(null);
    } catch (err) {
      setError("Failed to save tasks");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingTasks]);

  // Auto-save after changes (debounced)
  useEffect(() => {
    if (!pendingTasks) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingTasks, save]);

  return {
    tasks,
    setTasks,
    isLoading,
    error,
    save,
    isSaving,
  };
}
