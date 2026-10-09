"use client";

import React, { useState } from "react";
import { useAdvisoryBoard, BoardMember } from "@/hooks/useAdvisoryBoard";

interface Deadline {
  id: string;
  title: string;
  date: string;
  description: string;
  status: "upcoming" | "due_soon" | "overdue" | "completed";
}

interface SLO {
  id: string;
  number: number;
  title: string;
  description: string;
  year: string;
  sources: string;
  criteria: string;
}

// Final plan: Assessment/MAIL Assessment Proposal.html (adopted October 2026
// after Advisory Board review).
const studentLearningOutcomes: SLO[] = [
  {
    id: "slo-1",
    number: 1,
    title: "Understand AI Principles",
    description: "Understand principles and long-term trends that explain AI",
    year: "Spring 2027",
    sources: "MAIL 503 (Foundations/History) or MAIL 557 (AI Literacy; Core Concepts only)",
    criteria: "Core Concepts; Historical Trajectory (scored on MAIL 503 artifacts)",
  },
  {
    id: "slo-2",
    number: 2,
    title: "Ethical Integration",
    description: "Integrate AI ethically with a broad range of human concerns",
    year: "Spring 2028",
    sources: "MAIL 523 (Ethics), MAIL 593 (Alignment), or MAIL 643 (Law)",
    criteria: "Ethical Identification; Integration",
  },
  {
    id: "slo-3",
    number: 3,
    title: "Lead AI Projects",
    description: "Lead AI projects of genuine and enduring value",
    year: "Spring 2029",
    sources:
      "MAIL 607/619 (Opportunity/Implementation), MAIL 659 (Institutional Change*), or MAIL 677 (Leadership in Practice)",
    criteria: "Strategic Alignment; Implementation Viability",
  },
];

const planElements: { label: string; value: string }[] = [
  { label: "Cycle", value: "One SLO per year for three years, then an off year (4-year cycle; Spring 2030 off, repeats 2031)" },
  { label: "Artifact", value: "Portfolio pieces from graduating students" },
  { label: "Assessors", value: "Program Director + volunteers from the Advisory Board" },
  {
    label: "Process",
    value:
      "Norming session before each assessment (how to evaluate gaps, practice on previously scored artifacts, paradigm examples); single assessor per artifact thereafter",
  },
  { label: "Scale", value: "Meets / Approaches / Does Not Meet Expectations" },
  {
    label: "Target",
    value: "On each rubric criterion, no more than 20% of assessed students score Does Not Meet Expectations",
  },
];

function getDeadlineStatus(dateStr: string): Deadline["status"] {
  const date = new Date(dateStr);
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  if (date < now) return "overdue";
  if (date < thirtyDaysFromNow) return "due_soon";
  return "upcoming";
}

const deadlines: Deadline[] = [
  {
    id: "d-1",
    title: "ULAC Assessment Reflection",
    date: "2026-10-05",
    description:
      "Submitted: Q3.5c of the 2025-26 annual unit report (sent to Bock and Ditty for Oct 5); Q3.5a form submitted Sep 30 with the draft plan",
    status: "completed",
  },
  {
    id: "d-2",
    title: "Assessment Plan Adopted",
    date: "2026-10-09",
    description:
      "Draft reviewed by the Advisory Board (Distelzweig, Moon) and revised into the final plan",
    status: "completed",
  },
  {
    id: "d-3",
    title: "Advisory Board Meeting",
    date: "2027-03-01",
    description: "Convene MAIL Advisory Board for program review",
    status: getDeadlineStatus("2027-03-01"),
  },
  {
    id: "d-4",
    title: "First SLO Assessment (SLO 1)",
    date: "2027-04-15",
    description:
      "Norming session, then score SLO 1 portfolio pieces from the first graduating cohort",
    status: getDeadlineStatus("2027-04-15"),
  },
];

function StatusBadge({ status }: { status: Deadline["status"] }) {
  const styles = {
    upcoming: "bg-gray-100 text-gray-600",
    due_soon: "bg-amber-100 text-amber-700",
    overdue: "bg-red-100 text-red-700",
    completed: "bg-green-100 text-green-700",
  };

  const labels = {
    upcoming: "Upcoming",
    due_soon: "Due Soon",
    overdue: "Overdue",
    completed: "Completed",
  };

  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function daysUntil(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${Math.abs(diff)} days ago`;
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `${diff} days`;
}

export default function AssessmentTab() {
  return (
    <div className="p-6 space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-2">Assessment & Accreditation</h2>
        <p className="text-gray-600 text-sm">
          Track program assessment, accreditation requirements, and advisory board planning.
        </p>
      </div>

      {/* Key Deadlines */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Key Deadlines</h3>
        <div className="space-y-3">
          {deadlines.map((deadline) => (
            <div
              key={deadline.id}
              className={`p-4 rounded-lg border ${
                deadline.status === "due_soon"
                  ? "border-amber-200 bg-amber-50"
                  : deadline.status === "overdue"
                  ? "border-red-200 bg-red-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{deadline.title}</span>
                    <StatusBadge status={deadline.status} />
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{deadline.description}</p>
                  <div className="text-xs text-gray-500">
                    {formatDate(deadline.date)} ({daysUntil(deadline.date)})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Assessment Plan */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Assessment Plan</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-100">
              {planElements.map((el) => (
                <tr key={el.label}>
                  <td className="py-2 px-3 font-medium text-gray-700 w-28 align-top">{el.label}</td>
                  <td className="py-2 px-3 text-gray-600">{el.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Learning Outcomes */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">Student Learning Outcomes (SLOs)</h3>
        <p className="text-sm text-gray-500 mb-4">
          Graduates of the MAIL program will be able to:
        </p>
        <div className="space-y-4">
          {studentLearningOutcomes.map((slo) => (
            <div
              key={slo.id}
              className="p-4 border border-gray-200 rounded-lg bg-white"
            >
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                  {slo.number}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{slo.title}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {slo.year}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{slo.description}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Portfolio sources:</span> {slo.sources}
                  </p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Rubric criteria:</span> {slo.criteria}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Name change from &ldquo;AI and Communication&rdquo; pending, October 9, 2026.
        </p>
      </section>

      {/* HLC Requirements */}
      <section>
        <h3 className="font-medium text-gray-700 mb-4">HLC Accreditation</h3>
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-3">
            The Higher Learning Commission (HLC) requires ongoing assessment of student learning
            and program effectiveness. Key requirements:
          </p>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Clear articulation of program-level learning outcomes</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Regular assessment of student achievement</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Evidence of continuous improvement based on assessment results</span>
            </li>
            <li className="flex items-start gap-2">
              <svg className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Advisory board input on curriculum relevance</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Advisory Board */}
      <AdvisoryBoardSection />
    </div>
  );
}

function EditableCell({
  value,
  onCommit,
  placeholder = "",
  type = "text",
}: {
  value: string;
  onCommit: (val: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "date";
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <input
        type={type}
        className="border border-blue-300 rounded px-2 py-1 text-sm w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => { setEditing(false); onCommit(draft); }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { setEditing(false); onCommit(draft); }
          if (e.key === "Escape") { setEditing(false); setDraft(value); }
        }}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      className="cursor-pointer hover:bg-gray-100 rounded px-2 py-1 inline-block min-w-[2rem]"
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Click to edit"
    >
      {value || <span className="text-gray-300">{placeholder || "—"}</span>}
    </span>
  );
}

function AdvisoryBoardSection() {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    isLoading,
    error,
    isSaving,
  } = useAdvisoryBoard();

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-medium text-gray-700">MAIL Advisory Board</h3>
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <button
          onClick={addMember}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add Member
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Name</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Email</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Organization</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Date Added</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Notes</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    No members yet. Click &quot;+ Add Member&quot; to get started.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="py-1.5 px-3">
                      <EditableCell
                        value={member.name}
                        onCommit={(val) => updateMember(member.id, { name: val })}
                        placeholder="Name"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <EditableCell
                        value={member.email}
                        onCommit={(val) => updateMember(member.id, { email: val })}
                        placeholder="Email"
                        type="email"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <EditableCell
                        value={member.organization}
                        onCommit={(val) => updateMember(member.id, { organization: val })}
                        placeholder="Organization"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <EditableCell
                        value={member.dateAdded}
                        onCommit={(val) => updateMember(member.id, { dateAdded: val })}
                        placeholder="YYYY-MM-DD"
                        type="date"
                      />
                    </td>
                    <td className="py-1.5 px-3">
                      <EditableCell
                        value={member.notes}
                        onCommit={(val) => updateMember(member.id, { notes: val })}
                        placeholder="Notes"
                      />
                    </td>
                    <td className="py-1.5 px-2">
                      <button
                        onClick={() => deleteMember(member.id)}
                        className="text-gray-300 hover:text-red-500 text-xs"
                        title="Delete"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
