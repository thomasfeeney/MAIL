"use client";

import React from "react";

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
  assessmentPlan: string;
}

const studentLearningOutcomes: SLO[] = [
  {
    id: "slo-1",
    number: 1,
    title: "Understand AI Principles",
    description: "Understand principles and long-term trends that explain AI",
    assessmentPlan: "Assessed through foundational course assignments and comprehensive exams",
  },
  {
    id: "slo-2",
    number: 2,
    title: "Ethical Integration",
    description: "Integrate AI ethically with a broad range of human concerns",
    assessmentPlan: "Assessed through ethics case studies and portfolio reflections",
  },
  {
    id: "slo-3",
    number: 3,
    title: "Lead AI Projects",
    description: "Lead AI projects of genuine and enduring value",
    assessmentPlan: "Assessed through capstone project and leadership practicum",
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
    date: "2026-10-01",
    description: "Submit assessment reflection report to ULAC committee",
    status: getDeadlineStatus("2026-10-01"),
  },
  {
    id: "d-2",
    title: "First SLO Assessment",
    date: "2027-04-15",
    description: "Complete first round of Student Learning Outcomes assessment",
    status: getDeadlineStatus("2027-04-15"),
  },
  {
    id: "d-3",
    title: "Advisory Board Meeting",
    date: "2027-03-01",
    description: "Convene MAIL Advisory Board for program review",
    status: getDeadlineStatus("2027-03-01"),
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
                  <h4 className="font-medium text-gray-900 mb-1">{slo.title}</h4>
                  <p className="text-sm text-gray-700 mb-2">{slo.description}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">Assessment:</span> {slo.assessmentPlan}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
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
      <section>
        <h3 className="font-medium text-gray-700 mb-4">MAIL Advisory Board</h3>
        <div className="p-4 border border-amber-200 rounded-lg bg-amber-50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm text-amber-800 font-medium mb-1">
                Advisory Board Needed by Spring 2027
              </p>
              <p className="text-sm text-amber-700">
                Establish an advisory board with industry professionals, alumni, and academic
                partners to provide guidance on curriculum relevance and program direction.
              </p>
              <div className="mt-3">
                <span className="text-xs text-amber-600">Status: Not Started</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
