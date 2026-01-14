"use client";

import { useState, useEffect, useCallback } from "react";

export interface Contact {
  id: string;
  name: string;
  role: string;
  email: string;
  notes: string;
}

// Default contacts from CLAUDE.md
const defaultContacts: Contact[] = [
  { id: "1", name: "Kim Vrudny", role: "Handbook, charter, assessment", email: "", notes: "" },
  { id: "2", name: "Alley Benton", role: "Admissions workflow, approvals", email: "", notes: "" },
  { id: "3", name: "Hannah Mikels", role: "SPEED Team", email: "", notes: "" },
  { id: "4", name: "Suzanne", role: "Student welcome hub, contracts", email: "", notes: "" },
  { id: "5", name: "Sarah Smith", role: "Accreditation and assessment", email: "", notes: "" },
  { id: "6", name: "Tonia Bock", role: "ULAC consultation", email: "", notes: "" },
  { id: "7", name: "Lisa Klein", role: "Marketing lead", email: "", notes: "" },
  { id: "8", name: "Adam Brunner", role: "Website", email: "", notes: "" },
  { id: "9", name: "Keturah", role: "Application portal", email: "", notes: "" },
  { id: "10", name: "Jo Montie", role: "Digital learning, accessibility", email: "", notes: "" },
];

interface UseContactsResult {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: () => void;
  deleteContact: (id: string) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  isLoading: boolean;
  error: string | null;
  isSaving: boolean;
}

export function useContacts(): UseContactsResult {
  const [contacts, setContactsState] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingContacts, setPendingContacts] = useState<Contact[] | null>(null);

  // Load contacts on mount
  useEffect(() => {
    async function loadContacts() {
      try {
        const response = await fetch("/api/contacts");
        if (response.ok) {
          const data = await response.json();
          if (data.length === 0) {
            // No contacts in sheet yet, use defaults and save them
            setContactsState(defaultContacts);
            setPendingContacts(defaultContacts);
          } else {
            setContactsState(data);
          }
        } else {
          setError("Failed to load contacts");
        }
      } catch (err) {
        setError("Failed to load contacts");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadContacts();
  }, []);

  // Update contacts and queue save
  const setContacts = useCallback((newContacts: Contact[]) => {
    setContactsState(newContacts);
    setPendingContacts(newContacts);
  }, []);

  const addContact = useCallback(() => {
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      name: "",
      role: "",
      email: "",
      notes: "",
    };
    const updated = [...contacts, newContact];
    setContacts(updated);
  }, [contacts, setContacts]);

  const deleteContact = useCallback((id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
  }, [contacts, setContacts]);

  const updateContact = useCallback((id: string, updates: Partial<Contact>) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    );
    setContacts(updated);
  }, [contacts, setContacts]);

  // Save contacts
  const save = useCallback(async () => {
    if (!pendingContacts) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingContacts),
      });

      if (!response.ok) {
        throw new Error("Failed to save");
      }

      setPendingContacts(null);
    } catch (err) {
      setError("Failed to save contacts");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [pendingContacts]);

  // Auto-save after changes (debounced)
  useEffect(() => {
    if (!pendingContacts) return;

    const timeout = setTimeout(() => {
      save();
    }, 1000);

    return () => clearTimeout(timeout);
  }, [pendingContacts, save]);

  return {
    contacts,
    setContacts,
    addContact,
    deleteContact,
    updateContact,
    isLoading,
    error,
    isSaving,
  };
}
