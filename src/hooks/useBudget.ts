"use client";

import { useState, useEffect, useCallback } from "react";

export interface FiscalYear {
  id: string;
  fiscalYear: string;
  tuitionPerCredit: number;
  totalEnrollment: number;
  ustFacultyStaff: number;
  scholarshipAllotted: number;
  discretionary: number;
  notes: string;
}

const defaultFiscalYears: FiscalYear[] = [
  {
    id: "fy26",
    fiscalYear: "FY26",
    tuitionPerCredit: 900,
    totalEnrollment: 14,
    ustFacultyStaff: 2,
    scholarshipAllotted: 9000,
    discretionary: 9500,
    notes: "",
  },
  {
    id: "fy27",
    fiscalYear: "FY27",
    tuitionPerCredit: 900,
    totalEnrollment: 0,
    ustFacultyStaff: 0,
    scholarshipAllotted: 0,
    discretionary: 0,
    notes: "",
  },
];

interface UseBudgetResult {
  fiscalYears: FiscalYear[];
  updateFiscalYear: (id: string, updates: Partial<FiscalYear>) => void;
  addFiscalYear: (name: string) => void;
  deleteFiscalYear: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useBudget(): UseBudgetResult {
  const [fiscalYears, setFiscalYearsState] = useState<FiscalYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingItems, setPendingItems] = useState<FiscalYear[] | null>(null);

  useEffect(() => {
    async function loadBudget() {
      try {
        const response = await fetch("/api/budget");
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            setFiscalYearsState(defaultFiscalYears);
            setPendingItems(defaultFiscalYears);
          } else {
            setFiscalYearsState(data);
          }
        } else {
          setError("Failed to load budget");
        }
      } catch (err) {
        setError("Failed to load budget");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBudget();
  }, []);

  const setItems = useCallback((newItems: FiscalYear[]) => {
    setFiscalYearsState(newItems);
    setPendingItems(newItems);
  }, []);

  const updateFiscalYear = useCallback((id: string, updates: Partial<FiscalYear>) => {
    const updated = fiscalYears.map((fy) =>
      fy.id === id ? { ...fy, ...updates } : fy
    );
    setItems(updated);
  }, [fiscalYears, setItems]);

  const addFiscalYear = useCallback((name: string) => {
    const newFY: FiscalYear = {
      id: `fy-${Date.now()}`,
      fiscalYear: name,
      tuitionPerCredit: 900,
      totalEnrollment: 0,
      ustFacultyStaff: 0,
      scholarshipAllotted: 0,
      discretionary: 0,
      notes: "",
    };
    setItems([...fiscalYears, newFY]);
  }, [fiscalYears, setItems]);

  const deleteFiscalYear = useCallback((id: string) => {
    setItems(fiscalYears.filter((fy) => fy.id !== id));
  }, [fiscalYears, setItems]);

  const save = useCallback(async () => {
    if (!pendingItems) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingItems),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingItems(null);
    } catch (err) {
      setError("Failed to save budget");
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
    fiscalYears,
    updateFiscalYear,
    addFiscalYear,
    deleteFiscalYear,
    isLoading,
    error,
    isSaving,
  };
}
