"use client";

import { useState, useEffect, useCallback } from "react";

export interface Expense {
  id: string;
  fiscalYear: string;
  description: string;
  amount: number;
  notes: string;
}

interface UseExpensesResult {
  expenses: Expense[];
  addExpense: (fiscalYear: string) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  deleteExpense: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useExpenses(): UseExpensesResult {
  const [expenses, setExpensesState] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingExpenses, setPendingExpenses] = useState<Expense[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/expenses");
        if (response.ok) {
          const data = await response.json();
          setExpensesState(data);
        } else {
          setError("Failed to load expenses");
        }
      } catch (err) {
        setError("Failed to load expenses");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const setExpenses = useCallback((items: Expense[]) => {
    setExpensesState(items);
    setPendingExpenses(items);
  }, []);

  const addExpense = useCallback((fiscalYear: string) => {
    const newExpense: Expense = {
      id: `expense-${Date.now()}`,
      fiscalYear,
      description: "",
      amount: 0,
      notes: "",
    };
    setExpenses([...expenses, newExpense]);
  }, [expenses, setExpenses]);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    const updated = expenses.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    setExpenses(updated);
  }, [expenses, setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  }, [expenses, setExpenses]);

  const save = useCallback(async () => {
    if (!pendingExpenses) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingExpenses),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingExpenses(null);
    } catch (err) {
      setError("Failed to save expenses");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingExpenses]);

  useEffect(() => {
    if (!pendingExpenses) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingExpenses, save]);

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading,
    error,
    isSaving,
  };
}
