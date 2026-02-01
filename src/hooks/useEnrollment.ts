"use client";

import { useState, useEffect, useCallback } from "react";

export interface EnrollmentEntry {
  id: string;
  fiscalYear: string;
  term: string;
  tuitionPaying: number;
  onBenefits: number;
  nonDegree: number;
  electiveSeekers: number;
}

const TERMS = ["Summer A", "Summer B", "Fall A", "Fall B", "Spring A", "Spring B"];

function createDefaultEntries(fiscalYear: string): EnrollmentEntry[] {
  return TERMS.map((term, i) => ({
    id: `${fiscalYear.toLowerCase()}-${term.toLowerCase().replace(" ", "")}`,
    fiscalYear,
    term,
    tuitionPaying: 0,
    onBenefits: 0,
    nonDegree: 0,
    electiveSeekers: 0,
  }));
}

const defaultEnrollment: EnrollmentEntry[] = [
  ...createDefaultEntries("FY26"),
  ...createDefaultEntries("FY27"),
];

// Pre-populate FY26 with known data
defaultEnrollment[2] = { ...defaultEnrollment[2], tuitionPaying: 8, onBenefits: 2 }; // Fall A
defaultEnrollment[3] = { ...defaultEnrollment[3], tuitionPaying: 12, onBenefits: 2, nonDegree: 2 }; // Fall B

interface UseEnrollmentResult {
  enrollment: EnrollmentEntry[];
  updateEntry: (id: string, updates: Partial<EnrollmentEntry>) => void;
  ensureFiscalYear: (fiscalYear: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useEnrollment(): UseEnrollmentResult {
  const [enrollment, setEnrollmentState] = useState<EnrollmentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<EnrollmentEntry[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/enrollment");
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setEnrollmentState(defaultEnrollment);
            setPendingItems(defaultEnrollment);
          } else {
            setEnrollmentState(data);
          }
        } else {
          setError("Failed to load enrollment");
        }
      } catch (err) {
        setError("Failed to load enrollment");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const setItems = useCallback((items: EnrollmentEntry[]) => {
    setEnrollmentState(items);
    setPendingItems(items);
  }, []);

  const updateEntry = useCallback((id: string, updates: Partial<EnrollmentEntry>) => {
    const updated = enrollment.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    setItems(updated);
  }, [enrollment, setItems]);

  const ensureFiscalYear = useCallback((fiscalYear: string) => {
    const existing = enrollment.filter((e) => e.fiscalYear === fiscalYear);
    if (existing.length > 0) return;
    setItems([...enrollment, ...createDefaultEntries(fiscalYear)]);
  }, [enrollment, setItems]);

  const save = useCallback(async () => {
    if (!pendingItems) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/enrollment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingItems),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingItems(null);
    } catch (err) {
      setError("Failed to save enrollment");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingItems]);

  useEffect(() => {
    if (!pendingItems) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingItems, save]);

  return {
    enrollment,
    updateEntry,
    ensureFiscalYear,
    isLoading,
    error,
    isSaving,
  };
}
