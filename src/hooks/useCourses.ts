"use client";

import { useState, useEffect, useCallback } from "react";

export interface CourseCheckpoints {
  securedTeacher: boolean;
  contractSigned: boolean;
  inBannerCanvas: boolean;
  stelarTemplate: boolean;
  bookAdoptions: boolean;
  shellComplete: boolean;
  materialsDocumented: boolean;
  stipendPaid: boolean;
  videoRecorded: boolean;
  feedbackCollected: boolean;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  term: string;
  faculty: string;
  facultyConfirmed: boolean;
  checkpoints: CourseCheckpoints;
}

// Default courses for initial population
const defaultCourses: Course[] = [
  {
    id: "1",
    code: "MAIL 503",
    name: "Foundations and History of AI",
    term: "2025 Fall A",
    faculty: "Distelzweig",
    facultyConfirmed: true,
    checkpoints: {
      securedTeacher: true,
      contractSigned: true,
      inBannerCanvas: true,
      stelarTemplate: true,
      bookAdoptions: true,
      shellComplete: true,
      materialsDocumented: true,
      stipendPaid: false,
      videoRecorded: true,
      feedbackCollected: false,
    },
  },
  {
    id: "2",
    code: "MAIL 557",
    name: "AI Literacy for Leaders",
    term: "2025 Fall B",
    faculty: "Moon",
    facultyConfirmed: true,
    checkpoints: {
      securedTeacher: true,
      contractSigned: true,
      inBannerCanvas: true,
      stelarTemplate: true,
      bookAdoptions: true,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: true,
      feedbackCollected: false,
    },
  },
  {
    id: "3",
    code: "MAIL 571",
    name: "AI Applications and Ecosystems",
    term: "2026 Spring A",
    faculty: "Keiser",
    facultyConfirmed: true,
    checkpoints: {
      securedTeacher: true,
      contractSigned: true,
      inBannerCanvas: true,
      stelarTemplate: true,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: true,
      feedbackCollected: false,
    },
  },
  {
    id: "4",
    code: "MAIL 523",
    name: "AI, Ethics, and Society",
    term: "2026 Spring B",
    faculty: "Feeney",
    facultyConfirmed: true,
    checkpoints: {
      securedTeacher: true,
      contractSigned: true,
      inBannerCanvas: false,
      stelarTemplate: true,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: true,
      feedbackCollected: false,
    },
  },
  {
    id: "5",
    code: "MAIL 593",
    name: "AI Alignment: Bias, Hallucination, Reward Hacking",
    term: "2026 Summer A",
    faculty: "Stoltz",
    facultyConfirmed: true,
    checkpoints: {
      securedTeacher: true,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
  {
    id: "6",
    code: "MAIL 607",
    name: "Identifying AI Opportunities",
    term: "2026 Summer B",
    faculty: "Price",
    facultyConfirmed: false,
    checkpoints: {
      securedTeacher: false,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
  {
    id: "7",
    code: "MAIL 619",
    name: "Implementing AI Solutions",
    term: "2026 Fall A",
    faculty: "Price",
    facultyConfirmed: false,
    checkpoints: {
      securedTeacher: false,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
  {
    id: "8",
    code: "MAIL 643",
    name: "AI Law, Regulation, Liability and Compliance",
    term: "2026 Fall B",
    faculty: "Jules Porter",
    facultyConfirmed: false,
    checkpoints: {
      securedTeacher: false,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
  {
    id: "9",
    code: "MAIL 659",
    name: "AI and Communication",
    term: "2027 Spring A",
    faculty: "Omodt",
    facultyConfirmed: false,
    checkpoints: {
      securedTeacher: false,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
  {
    id: "10",
    code: "MAIL 677",
    name: "AI Leadership in Practice: Topics",
    term: "2027 Spring B",
    faculty: "Beasley??",
    facultyConfirmed: false,
    checkpoints: {
      securedTeacher: false,
      contractSigned: false,
      inBannerCanvas: false,
      stelarTemplate: false,
      bookAdoptions: false,
      shellComplete: false,
      materialsDocumented: false,
      stipendPaid: false,
      videoRecorded: false,
      feedbackCollected: false,
    },
  },
];

interface UseCoursesResult {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useCourses(): UseCoursesResult {
  const [courses, setCoursesState] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingCourses, setPendingCourses] = useState<Course[] | null>(null);

  // Load courses on mount
  useEffect(() => {
    async function loadCourses() {
      try {
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length === 0) {
            // No courses in sheet yet, use defaults and save them
            setCoursesState(defaultCourses);
            setPendingCourses(defaultCourses);
          } else if (Array.isArray(data)) {
            // Parse checkpoints JSON from sheet data
            const parsed = data.map((row: any) => ({
              ...row,
              checkpoints: JSON.parse(row.checkpoints || "{}"),
            }));
            setCoursesState(parsed);
          } else {
            setError("Unexpected response format");
          }
        } else if (response.status === 401) {
          setError("Session expired. Please sign out and sign in again.");
        } else {
          const data = await response.json().catch(() => ({}));
          setError("Failed to load courses: " + (data.error || `Error ${response.status}`));
        }
      } catch (err) {
        setError("Failed to load courses");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCourses();
  }, []);

  // Update courses and queue save
  const setCourses = useCallback((newCourses: Course[]) => {
    setCoursesState(newCourses);
    setPendingCourses(newCourses);
  }, []);

  // Save courses
  const save = useCallback(async () => {
    if (!pendingCourses) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          pendingCourses.map((c) => ({
            id: c.id,
            code: c.code,
            name: c.name,
            term: c.term,
            faculty: c.faculty,
            facultyConfirmed: c.facultyConfirmed,
            checkpoints: JSON.stringify(c.checkpoints),
          }))
        ),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingCourses(null);
    } catch (err) {
      setError("Failed to save courses");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingCourses]);

  // Auto-save after changes (debounced)
  useEffect(() => {
    if (!pendingCourses) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingCourses, save]);

  return {
    courses,
    setCourses,
    isLoading,
    error,
    isSaving,
  };
}
