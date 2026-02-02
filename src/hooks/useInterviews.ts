"use client";

import { useState, useEffect, useCallback } from "react";

export interface Interview {
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

export interface StageNotes {
  [stage: string]: string;
}

const DEFAULT_STAGE_NOTES: StageNotes = {
  prospect: "Identified a potential guest. Capture name, title, org, and who referred them. No outreach yet.",
  contacted: "Sent initial outreach (email/LinkedIn). Waiting for response.",
  booked: "Guest agreed. Date confirmed. Pre-interview rapport call scheduled or completed.",
  recorded: "Interview conducted in studio. Raw footage captured.",
  editing: "Post-production in progress (cuts, titles, review).",
  published: "Video posted to YouTube/LinkedIn. Promotion underway.",
};

interface UseInterviewsResult {
  interviews: Interview[];
  setInterviews: (interviews: Interview[]) => void;
  addInterview: () => Interview;
  deleteInterview: (id: string) => void;
  updateInterview: (id: string, updates: Partial<Interview>) => void;
  stageNotes: StageNotes;
  updateStageNote: (stage: string, notes: string) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useInterviews(): UseInterviewsResult {
  const [interviews, setInterviewsState] = useState<Interview[]>([]);
  const [stageNotes, setStageNotesState] = useState<StageNotes>(DEFAULT_STAGE_NOTES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingInterviews, setPendingInterviews] = useState<Interview[] | null>(null);
  const [pendingStageNotes, setPendingStageNotes] = useState<StageNotes | null>(null);

  // Load interviews and stage notes on mount
  useEffect(() => {
    async function load() {
      try {
        const [interviewsRes, notesRes] = await Promise.all([
          fetch("/api/interviews"),
          fetch("/api/interview-stage-notes"),
        ]);

        if (interviewsRes.ok) {
          const data = await interviewsRes.json();
          setInterviewsState(data);
        } else {
          setError("Failed to load interviews");
        }

        if (notesRes.ok) {
          const data = await notesRes.json();
          if (data.length > 0) {
            const notesMap: StageNotes = {};
            data.forEach((row: { stage: string; notes: string }) => {
              notesMap[row.stage] = row.notes;
            });
            setStageNotesState(notesMap);
          } else {
            // No notes saved yet — seed with defaults and save them
            setPendingStageNotes(DEFAULT_STAGE_NOTES);
          }
        }
      } catch (err) {
        setError("Failed to load interviews");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  // Update interviews and queue save
  const setInterviews = useCallback((newInterviews: Interview[]) => {
    setInterviewsState(newInterviews);
    setPendingInterviews(newInterviews);
  }, []);

  const addInterview = useCallback((): Interview => {
    const newInterview: Interview = {
      id: `interview-${Date.now()}`,
      guestName: "",
      guestTitle: "",
      guestOrganization: "",
      guestEmail: "",
      guestLinkedIn: "",
      status: "prospect",
      notes: "",
      scheduledDate: "",
      recordedDate: "",
      publishedDate: "",
      publishedUrl: "",
      referredBy: "",
    };
    const updated = [...interviews, newInterview];
    setInterviewsState(updated);
    setPendingInterviews(updated);
    return newInterview;
  }, [interviews]);

  const deleteInterview = useCallback((id: string) => {
    const updated = interviews.filter((i) => i.id !== id);
    setInterviews(updated);
  }, [interviews, setInterviews]);

  const updateInterview = useCallback((id: string, updates: Partial<Interview>) => {
    const updated = interviews.map((i) =>
      i.id === id ? { ...i, ...updates } : i
    );
    setInterviews(updated);
  }, [interviews, setInterviews]);

  const updateStageNote = useCallback((stage: string, notes: string) => {
    const updated = { ...stageNotes, [stage]: notes };
    setStageNotesState(updated);
    setPendingStageNotes(updated);
  }, [stageNotes]);

  // Save interviews
  const saveInterviews = useCallback(async () => {
    if (!pendingInterviews) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingInterviews),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingInterviews(null);
    } catch (err) {
      setError("Failed to save interviews");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingInterviews]);

  // Save stage notes
  const saveStageNotes = useCallback(async () => {
    if (!pendingStageNotes) return;

    setIsSaving(true);
    try {
      const payload = Object.entries(pendingStageNotes).map(([stage, notes]) => ({
        stage,
        notes,
      }));

      const response = await fetch("/api/interview-stage-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to save stage notes");
      }

      setPendingStageNotes(null);
    } catch (err) {
      setError("Failed to save stage notes");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingStageNotes]);

  // Auto-save interviews (debounced)
  useEffect(() => {
    if (!pendingInterviews) return;

    const timeout = setTimeout(() => {
      saveInterviews();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingInterviews, saveInterviews]);

  // Auto-save stage notes (debounced)
  useEffect(() => {
    if (!pendingStageNotes) return;

    const timeout = setTimeout(() => {
      saveStageNotes();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingStageNotes, saveStageNotes]);

  return {
    interviews,
    setInterviews,
    addInterview,
    deleteInterview,
    updateInterview,
    stageNotes,
    updateStageNote,
    isLoading,
    error,
    isSaving,
  };
}
