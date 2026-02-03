"use client";

import { useState, useEffect, useCallback } from "react";

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  startTerm: string;
  status: 'active' | 'paused' | 'probation' | 'withdrawn' | 'graduated';
  benefitsEligible: boolean;
  benefitsStartTerm: string;
  coursesCompleted: string[]; // Array of course codes
  notes: string;
}

// All 10 MAIL course codes
export const ALL_COURSES = [
  "MAIL 503",
  "MAIL 557",
  "MAIL 571",
  "MAIL 523",
  "MAIL 593",
  "MAIL 607",
  "MAIL 619",
  "MAIL 643",
  "MAIL 659",
  "MAIL 677",
] as const;

interface UseStudentsResult {
  students: Student[];
  addStudent: () => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

// Seed data from the CSV
const SEED_STUDENTS: Omit<Student, "id">[] = [
  { firstName: "Jill", lastName: "Akervik", email: "JSAKERVIK@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Christa", lastName: "Asare", email: "ASAR9157@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Ingrid", lastName: "Barnett", email: "BARN1611@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Jennifer", lastName: "Bronner", email: "BRON7200@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Fred", lastName: "Damuth", email: "DAMU6130@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Ekram", lastName: "Elmoge", email: "ELMO5487@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Alexandros", lastName: "Gaffney", email: "GAFF6511@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Faiza", lastName: "Khassin", email: "KHAS3584@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Blair", lastName: "Lowry", email: "LOWR5613@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Joshua", lastName: "Roberts", email: "ROBE2111@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Alexander", lastName: "Smith", email: "SMIT9427@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "John", lastName: "Traxler", email: "TRAX1863@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Christopher", lastName: "Wheaton", email: "CSWHEATON@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Bradford", lastName: "Williams", email: "WILL1363@STTHOMAS.EDU", startTerm: "2025 Fall A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Keturah", lastName: "Cox", email: "KCOX@STTHOMAS.EDU", startTerm: "2026 Spring A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Ashley", lastName: "Montgomery", email: "MONT3937@STTHOMAS.EDU", startTerm: "2026 Spring A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Megan", lastName: "Baryenburch", email: "BARY8579@STTHOMAS.EDU", startTerm: "2026 Spring A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
  { firstName: "Joseph", lastName: "Livingston", email: "LIVI8525@STTHOMAS.EDU", startTerm: "2026 Spring A", status: "active", benefitsEligible: false, benefitsStartTerm: "", coursesCompleted: [], notes: "" },
];

export function useStudents(): UseStudentsResult {
  const [students, setStudentsState] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingStudents, setPendingStudents] = useState<Student[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/students");
        if (response.ok) {
          const data = await response.json();
          // Parse coursesCompleted from JSON string to array
          const parsed = data.map((s: { coursesCompleted: string } & Omit<Student, "coursesCompleted">) => ({
            ...s,
            coursesCompleted: s.coursesCompleted ? JSON.parse(s.coursesCompleted) : [],
          }));

          if (parsed.length === 0) {
            // Seed with initial data
            const seeded = SEED_STUDENTS.map((s, i) => ({
              ...s,
              id: `student-${Date.now()}-${i}`,
            }));
            setStudentsState(seeded);
            setPendingStudents(seeded);
          } else {
            setStudentsState(parsed);
          }
        } else {
          setError("Failed to load students");
        }
      } catch (err) {
        setError("Failed to load students");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const setStudents = useCallback((items: Student[]) => {
    setStudentsState(items);
    setPendingStudents(items);
  }, []);

  const addStudent = useCallback((): Student => {
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      firstName: "",
      lastName: "",
      email: "",
      startTerm: "",
      status: "active",
      benefitsEligible: false,
      benefitsStartTerm: "",
      coursesCompleted: [],
      notes: "",
    };
    setStudents([...students, newStudent]);
    return newStudent;
  }, [students, setStudents]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    const updated = students.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setStudents(updated);
  }, [students, setStudents]);

  const deleteStudent = useCallback((id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  }, [students, setStudents]);

  const save = useCallback(async () => {
    if (!pendingStudents) return;

    setIsSaving(true);
    try {
      // Serialize coursesCompleted to JSON string for storage
      const toSave = pendingStudents.map((s) => ({
        ...s,
        coursesCompleted: JSON.stringify(s.coursesCompleted),
      }));

      const response = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingStudents(null);
    } catch (err) {
      setError("Failed to save students");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingStudents]);

  useEffect(() => {
    if (!pendingStudents) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingStudents, save]);

  return {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    isLoading,
    error,
    isSaving,
  };
}
