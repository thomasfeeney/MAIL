"use client";

import React, { useState } from "react";
import { useCourses, Course, CourseCheckpoints } from "@/hooks/useCourses";

// Term start dates (month, day) - year is determined by course term
const termStartDates: Record<string, { month: number; day: number }> = {
  "Fall A": { month: 8, day: 3 },    // September 3 (0-indexed month)
  "Fall B": { month: 9, day: 23 },   // October 23
  "Spring A": { month: 1, day: 2 },  // February 2
  "Spring B": { month: 2, day: 23 }, // March 23
  "Summer A": { month: 4, day: 28 }, // May 28
  "Summer B": { month: 6, day: 14 }, // July 14
};

// Checkpoint deadlines as weeks relative to course start (negative = before)
const checkpointOffsets: Record<keyof CourseCheckpoints, number> = {
  securedTeacher: -52,     // Faculty: 1 year before
  contractSigned: -30,     // Contract: 30 weeks before
  inBannerCanvas: -28,     // Banner: 28 weeks before
  stelarTemplate: -26,     // STELAR: 26 weeks before
  bookAdoptions: -15,      // Books: 15 weeks before
  shellComplete: -2,       // Shell: 2 weeks before
  stipendPaid: 0,          // Stipend: at course start
  materialsDocumented: 6,  // Materials: week 7 of the course
  videoRecorded: 8,        // Video: 8 weeks after
  feedbackCollected: 10,   // Feedback: 10 weeks after
};

type UrgencyStatus = "default" | "warning" | "overdue";

// Get the start date for a course based on its term
function getCourseStartDate(term: string): Date {
  const parts = term.split(" ");
  const year = parseInt(parts[0]);
  const termType = parts.slice(1).join(" "); // "Fall A", "Spring B", etc.

  const dateInfo = termStartDates[termType];
  if (!dateInfo) return new Date(); // fallback

  // For Spring/Summer terms, use the year directly
  // For Fall terms, use the year directly
  return new Date(year, dateInfo.month, dateInfo.day);
}

// Calculate due date for a checkpoint
function getCheckpointDueDate(courseStartDate: Date, checkpoint: keyof CourseCheckpoints): Date {
  const offsetWeeks = checkpointOffsets[checkpoint];
  const dueDate = new Date(courseStartDate);
  dueDate.setDate(dueDate.getDate() + offsetWeeks * 7);
  return dueDate;
}

// Determine urgency status for a checkpoint
function getUrgencyStatus(
  isChecked: boolean,
  dueDate: Date,
  now: Date = new Date()
): UrgencyStatus {
  if (isChecked) return "default";

  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const threeWeeksFromNow = new Date(now.getTime() + 3 * msPerWeek);

  if (dueDate < now) return "overdue";
  if (dueDate <= threeWeeksFromNow) return "warning";
  return "default";
}

const checkpointLabels: Record<keyof CourseCheckpoints, { short: string; full: string; link?: string; links?: { url: string; label: string }[] }> = {
  securedTeacher: { short: "Teacher", full: "Secure teacher & share resource doc", link: "https://docs.google.com/document/d/1sPF5f8LIbEJTSK4xv8hexb-foV6bwONa/edit?usp=sharing&ouid=102238583956326318387&rtpof=true&sd=true" },
  contractSigned: { short: "Contract", full: "Ask Allison to initiate contract workflow", links: [
    { url: "https://docs.google.com/document/d/1tBlrO5X8bXe-0pUUwcIrJ2_sEH-lrXoh/edit?usp=drive_link&ouid=102238583956326318387&rtpof=true&sd=true", label: "Contract template" },
    { url: "https://drive.google.com/file/d/1HeNLjPqOta9ttihYUjEq7K-TBWP73Ocl/view?usp=drive_link", label: "Email template" },
    { url: "https://uofstthomasmn.sharepoint.com/:f:/r/sites/mail/Shared%20Documents/01_Administration/Contracts%20%26%20Agreements/Course%20Development%20Agreements/Completed?csf=1&web=1&e=8kCKiR", label: "Completed" },
  ] },
  inBannerCanvas: { short: "Banner", full: "Teacher in Banner and Canvas" },
  stelarTemplate: { short: "STELAR", full: "STELAR template in Canvas & connect to STELAR partner (6 months before)" },
  bookAdoptions: { short: "Books", full: "Book adoptions submitted", link: "https://aip.bncollege.com/app/courselist/" },
  shellComplete: { short: "Shell", full: "Shell complete to STELAR standards. At minimum: syllabus, learning outcomes, and assignments that build toward the outcomes related to each module." },
  materialsDocumented: { short: "Materials", full: "List Pre-Existing and Individualized Materials during week 7, through STELAR's process. Lists are filed in the course's unpublished \"For Faculty Only - Canvas Resources\" module, with a backup copy in SharePoint with the signed Agreement. If passing the course to another: make archived backup and add helpful notes in \"For Faculty\" section, then remove the individualized materials." },
  stipendPaid: { short: "Stipend", full: "Stipend paid" },
  videoRecorded: { short: "Video", full: "30s video recorded" },
  feedbackCollected: { short: "Feedback", full: "Conversation. Written summary of what needs to change/update added to \"For Faculty\" module. Circulate Project Portfolio. Make contribution to knowledge clearing house and glossary on the Student Hub." },
};

const checkpointOrder: (keyof CourseCheckpoints)[] = [
  "contractSigned",
  "inBannerCanvas",
  "stelarTemplate",
  "bookAdoptions",
  "shellComplete",
  "stipendPaid",
  "materialsDocumented",
  "videoRecorded",
  "feedbackCollected",
];

function CheckboxCell({
  checked,
  onChange,
  urgency = "default"
}: {
  checked: boolean;
  onChange: () => void;
  urgency?: UrgencyStatus;
}) {
  // Determine cell and checkbox styling based on urgency
  const getCellClass = () => {
    if (checked) return "";
    if (urgency === "overdue") return "bg-rose-200";
    if (urgency === "warning") return "bg-amber-200";
    return "";
  };

  const getCheckboxClass = () => {
    if (checked) return "bg-green-500 border-green-500 text-white";
    if (urgency === "overdue") return "border-rose-500 hover:border-rose-600 bg-rose-100";
    if (urgency === "warning") return "border-amber-500 hover:border-amber-600 bg-amber-100";
    return "border-gray-300 hover:border-gray-400";
  };

  return (
    <td className={`px-2 py-2 text-center ${getCellClass()}`}>
      <button
        onClick={onChange}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${getCheckboxClass()}`}
      >
        {checked && (
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </td>
  );
}

interface FacultyCellProps {
  faculty: string;
  confirmed: boolean;
  isEditing: boolean;
  onStartEdit: () => void;
  onSave: (faculty: string, confirmed: boolean) => void;
  onCancel: () => void;
}

function FacultyCell({ faculty, confirmed, isEditing, onStartEdit, onSave, onCancel }: FacultyCellProps) {
  const [editName, setEditName] = useState(faculty);
  const [editConfirmed, setEditConfirmed] = useState(confirmed);

  // Reset local state when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setEditName(faculty);
      setEditConfirmed(confirmed);
    }
  }, [isEditing, faculty, confirmed]);

  const handleSave = () => {
    onSave(editName, editConfirmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  if (isEditing) {
    return (
      <td className="py-2 px-2">
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={editConfirmed}
                onChange={(e) => setEditConfirmed(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              Confirmed
            </label>
            <div className="flex gap-1">
              <button
                onClick={handleSave}
                className="px-2 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
              <button
                onClick={onCancel}
                className="px-2 py-0.5 text-xs text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </td>
    );
  }

  return (
    <td className="py-3 px-2">
      <button
        onClick={onStartEdit}
        className={`text-left hover:underline ${
          confirmed ? "text-gray-900" : "text-amber-600"
        }`}
        title={confirmed ? "Confirmed - click to edit" : "Tentative - click to edit"}
      >
        {faculty}
      </button>
    </td>
  );
}

export default function CoursesTab() {
  const { courses, setCourses, isLoading, error, isSaving } = useCourses();
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  const handleFacultySave = (courseId: string, faculty: string, confirmed: boolean) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              faculty,
              facultyConfirmed: confirmed,
              checkpoints: {
                ...course.checkpoints,
                securedTeacher: confirmed,
              },
            }
          : course
      )
    );
    setEditingCourseId(null);
  };

  const toggleCheckpoint = (courseId: string, checkpoint: keyof CourseCheckpoints) => {
    setCourses(
      courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              checkpoints: {
                ...course.checkpoints,
                [checkpoint]: !course.checkpoints[checkpoint],
              },
            }
          : course
      )
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-gray-400">Loading courses...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Course Pipeline</h2>
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <div className="text-sm text-gray-500">
          {courses.length} courses · 10 checkpoints each
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 font-medium text-gray-700 sticky left-0 bg-white">
                Course
              </th>
              <th className="text-left py-3 px-1 font-medium text-gray-700">Term</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Faculty</th>
              {checkpointOrder.map((key) => (
                <th
                  key={key}
                  className="text-center py-3 px-2 font-medium text-gray-700 text-xs whitespace-nowrap"
                  title={checkpointLabels[key].full}
                >
                  {checkpointLabels[key].short}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
                <tr
                  key={course.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2 sticky left-0 bg-white">
                    <div className="font-medium text-gray-900">{course.code}</div>
                    <div className="text-xs text-gray-500 max-w-[150px] truncate">
                      {course.name}
                    </div>
                  </td>
                  <td className="py-3 px-1 text-gray-600 whitespace-nowrap">
                    {course.term}
                  </td>
                  <FacultyCell
                    faculty={course.faculty}
                    confirmed={course.facultyConfirmed}
                    isEditing={editingCourseId === course.id}
                    onStartEdit={() => setEditingCourseId(course.id)}
                    onSave={(faculty, confirmed) => handleFacultySave(course.id, faculty, confirmed)}
                    onCancel={() => setEditingCourseId(null)}
                  />
                  {checkpointOrder.map((key) => {
                    const courseStartDate = getCourseStartDate(course.term);
                    const dueDate = getCheckpointDueDate(courseStartDate, key);
                    const urgency = getUrgencyStatus(course.checkpoints[key], dueDate);
                    return (
                      <CheckboxCell
                        key={key}
                        checked={course.checkpoints[key]}
                        onChange={() => toggleCheckpoint(course.id, key)}
                        urgency={urgency}
                      />
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">Checkpoint Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-flow-col md:grid-rows-5 gap-x-8 gap-y-3 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="font-semibold text-gray-800 w-20 shrink-0">Faculty:</span>
            <span>
              Secure teacher & share resource doc (click to edit; <span className="text-amber-600">orange</span> = tentative)
              <a
                href="https://docs.google.com/document/d/1sPF5f8LIbEJTSK4xv8hexb-foV6bwONa/edit?usp=sharing&ouid=102238583956326318387&rtpof=true&sd=true"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </span>
          </div>
          {checkpointOrder.map((key) => {
            const label = checkpointLabels[key];
            return (
              <div key={key} className="flex items-start">
                <span className="font-semibold text-gray-800 w-20 shrink-0">{label.short}:</span>
                <span>
                  {label.full}
                  {label.link && (
                    <a
                      href={label.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                  {label.links && label.links.map((linkItem, idx) => (
                    <a
                      key={idx}
                      href={linkItem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      {linkItem.label}
                      <svg className="w-3.5 h-3.5 inline-block ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ))}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
