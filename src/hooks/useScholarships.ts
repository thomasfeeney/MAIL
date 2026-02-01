"use client";

import { useState, useEffect, useCallback } from "react";

export interface Scholarship {
  id: string;
  fiscalYear: string;
  studentName: string;
  term: string;
  credits: number;
  perCreditDiscount: number;
  notes: string;
}

const defaultScholarships: Scholarship[] = [
  // FY26 — Fall A/B 2025
  { id: "s-wheaton-fall", fiscalYear: "FY26", studentName: "Christopher Wheaton", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 60, notes: "Tuition remission benefits start Spring 2027" },
  { id: "s-eloge-fall", fiscalYear: "FY26", studentName: "Ekram Eloge", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 300, notes: "" },
  { id: "s-gaffney-fall", fiscalYear: "FY26", studentName: "Alexandros Gaffney", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-traxler-fall", fiscalYear: "FY26", studentName: "JP Traxler", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-williams-fall", fiscalYear: "FY26", studentName: "Bradford Williams", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-roberts-fall", fiscalYear: "FY26", studentName: "Joshua Roberts", term: "Fall A/B 2025", credits: 6, perCreditDiscount: 60, notes: "" },
  // FY26 — Spring A/B 2026
  { id: "s-wheaton-spring", fiscalYear: "FY26", studentName: "Christopher Wheaton", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-eloge-spring", fiscalYear: "FY26", studentName: "Ekram Eloge", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 300, notes: "" },
  { id: "s-gaffney-spring", fiscalYear: "FY26", studentName: "Alexandros Gaffney", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-traxler-spring", fiscalYear: "FY26", studentName: "JP Traxler", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-williams-spring", fiscalYear: "FY26", studentName: "Bradford Williams", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-roberts-spring", fiscalYear: "FY26", studentName: "Joshua Roberts", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-livingston-spring", fiscalYear: "FY26", studentName: "Joseph Livingston", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 120, notes: "" },
  { id: "s-bance-spring", fiscalYear: "FY26", studentName: "Shereen Bance", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 60, notes: "" },
  { id: "s-ashley-spring", fiscalYear: "FY26", studentName: "Ashley (continuing)", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 45, notes: "" },
  { id: "s-singh-spring", fiscalYear: "FY26", studentName: "Roli Singh", term: "Spring A/B 2026", credits: 6, perCreditDiscount: 75, notes: "" },
  // Keturah Cox — considered but not funded yet
  { id: "s-cox-spring", fiscalYear: "FY26", studentName: "Keturah Cox", term: "Spring A/B 2026", credits: 0, perCreditDiscount: 0, notes: "No budget for Spring 2026. Consider for Summer 2026. Tuition remission benefits start Fall 2027" },
];

// Derive the next FY label: "FY26" -> "FY27"
function nextFiscalYear(fy: string): string {
  const match = fy.match(/^FY(\d+)$/);
  if (match) return `FY${parseInt(match[1]) + 1}`;
  return fy;
}

// Derive the Summer A/B term label for a fiscal year: "FY27" -> "Summer A/B 2026"
// UST fiscal years: FY27 starts Summer 2026
function summerTermForFY(fy: string): string {
  const match = fy.match(/^FY(\d+)$/);
  if (match) {
    const calendarYear = 2000 + parseInt(match[1]) - 1;
    return `Summer A/B ${calendarYear}`;
  }
  return `Summer A/B`;
}

interface UseScholarshipsResult {
  scholarships: Scholarship[];
  addScholarship: (fiscalYear: string) => void;
  updateScholarship: (id: string, updates: Partial<Scholarship>) => void;
  deleteScholarship: (id: string) => void;
  continueScholarship: (studentName: string, perCreditDiscount: number, fromFY: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useScholarships(): UseScholarshipsResult {
  const [scholarships, setScholarshipsState] = useState<Scholarship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingScholarships, setPendingScholarships] = useState<Scholarship[] | null>(null);

  useEffect(() => {
    async function loadScholarships() {
      try {
        const response = await fetch("/api/scholarships");
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setScholarshipsState(defaultScholarships);
            setPendingScholarships(defaultScholarships);
          } else {
            setScholarshipsState(data);
          }
        } else {
          setError("Failed to load scholarships");
        }
      } catch (err) {
        setError("Failed to load scholarships");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadScholarships();
  }, []);

  const setScholarships = useCallback((newScholarships: Scholarship[]) => {
    setScholarshipsState(newScholarships);
    setPendingScholarships(newScholarships);
  }, []);

  const addScholarship = useCallback((fiscalYear: string) => {
    const newScholarship: Scholarship = {
      id: `scholarship-${Date.now()}`,
      fiscalYear,
      studentName: "",
      term: "",
      credits: 6,
      perCreditDiscount: 0,
      notes: "",
    };
    setScholarships([...scholarships, newScholarship]);
  }, [scholarships, setScholarships]);

  const updateScholarship = useCallback((id: string, updates: Partial<Scholarship>) => {
    const updated = scholarships.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setScholarships(updated);
  }, [scholarships, setScholarships]);

  const deleteScholarship = useCallback((id: string) => {
    const updated = scholarships.filter((s) => s.id !== id);
    setScholarships(updated);
  }, [scholarships, setScholarships]);

  const continueScholarship = useCallback((studentName: string, perCreditDiscount: number, fromFY: string) => {
    const targetFY = nextFiscalYear(fromFY);
    const term = summerTermForFY(targetFY);

    // Check if this student already has a Summer entry in the target FY
    const existing = scholarships.find(
      (s) => s.fiscalYear === targetFY && s.studentName === studentName && s.term === term
    );
    if (existing) return;

    const newEntry: Scholarship = {
      id: `scholarship-${Date.now()}`,
      fiscalYear: targetFY,
      studentName,
      term,
      credits: 6,
      perCreditDiscount,
      notes: `Continued from ${fromFY}`,
    };
    setScholarships([...scholarships, newEntry]);
  }, [scholarships, setScholarships]);

  const save = useCallback(async () => {
    if (!pendingScholarships) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/scholarships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingScholarships),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingScholarships(null);
    } catch (err) {
      setError("Failed to save scholarships");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingScholarships]);

  useEffect(() => {
    if (!pendingScholarships) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingScholarships, save]);

  return {
    scholarships,
    addScholarship,
    updateScholarship,
    deleteScholarship,
    continueScholarship,
    isLoading,
    error,
    isSaving,
  };
}
