"use client";

import { useState, useEffect, useCallback } from "react";

export interface BoardMember {
  id: string;
  name: string;
  email: string;
  organization: string;
  dateAdded: string;
  notes: string;
}

interface UseAdvisoryBoardResult {
  members: BoardMember[];
  addMember: () => void;
  updateMember: (id: string, updates: Partial<BoardMember>) => void;
  deleteMember: (id: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useAdvisoryBoard(): UseAdvisoryBoardResult {
  const [members, setMembersState] = useState<BoardMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingMembers, setPendingMembers] = useState<BoardMember[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch("/api/advisory-board");
        if (response.ok) {
          const data = await response.json();
          setMembersState(data);
        } else {
          setError("Failed to load advisory board");
        }
      } catch (err) {
        setError("Failed to load advisory board");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const setMembers = useCallback((items: BoardMember[]) => {
    setMembersState(items);
    setPendingMembers(items);
  }, []);

  const addMember = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    const newMember: BoardMember = {
      id: `board-${Date.now()}`,
      name: "",
      email: "",
      organization: "",
      dateAdded: today,
      notes: "",
    };
    setMembers([...members, newMember]);
  }, [members, setMembers]);

  const updateMember = useCallback((id: string, updates: Partial<BoardMember>) => {
    const updated = members.map((m) =>
      m.id === id ? { ...m, ...updates } : m
    );
    setMembers(updated);
  }, [members, setMembers]);

  const deleteMember = useCallback((id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  }, [members, setMembers]);

  const save = useCallback(async () => {
    if (!pendingMembers) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/advisory-board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingMembers),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingMembers(null);
    } catch (err) {
      setError("Failed to save advisory board");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingMembers]);

  useEffect(() => {
    if (!pendingMembers) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingMembers, save]);

  return {
    members,
    addMember,
    updateMember,
    deleteMember,
    isLoading,
    error,
    isSaving,
  };
}
