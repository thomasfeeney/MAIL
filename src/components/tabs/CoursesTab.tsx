"use client";

import React, { useState } from "react";
import { useCourses, Course, CourseCheckpoints } from "@/hooks/useCourses";
import TimelineView from "./TimelineView";

type ViewMode = "matrix" | "timeline";

const checkpointLabels: Record<keyof CourseCheckpoints, { short: string; full: string }> = {
  securedTeacher: { short: "Teacher", full: "Secure teacher & share resource doc" },
  contractSigned: { short: "Contract", full: "Contract signed, countersigned by Kim, filed in MAIL SharePoint, Suzanne CC'd" },
  inBannerCanvas: { short: "Banner", full: "Teacher in Banner and Canvas" },
  stelarTemplate: { short: "STELAR", full: "STELAR template in Canvas & connect to STELAR partner (6 months before)" },
  bookAdoptions: { short: "Books", full: "Book adoptions submitted" },
  shellComplete: { short: "Shell", full: "Shell complete to STELAR standards" },
  materialsDocumented: { short: "Materials", full: "Pre-existing materials documented before paying stipend" },
  stipendPaid: { short: "Stipend", full: "Stipend paid" },
  videoRecorded: { short: "Video", full: "30s video recorded" },
  feedbackCollected: { short: "Feedback", full: "Feedback collected & documented" },
};

const checkpointOrder: (keyof CourseCheckpoints)[] = [
  "securedTeacher",
  "contractSigned",
  "inBannerCanvas",
  "stelarTemplate",
  "bookAdoptions",
  "shellComplete",
  "materialsDocumented",
  "stipendPaid",
  "videoRecorded",
  "feedbackCollected",
];

function CheckboxCell({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <td className="px-2 py-2 text-center">
      <button
        onClick={onChange}
        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
          checked
            ? "bg-green-500 border-green-500 text-white"
            : "border-gray-300 hover:border-gray-400"
        }`}
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

export default function CoursesTab() {
  const { courses, setCourses, isLoading, error, isSaving } = useCourses();
  const [viewMode, setViewMode] = useState<ViewMode>("matrix");

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

  const getProgress = (checkpoints: CourseCheckpoints) => {
    const total = Object.keys(checkpoints).length;
    const completed = Object.values(checkpoints).filter(Boolean).length;
    return { completed, total, percent: Math.round((completed / total) * 100) };
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
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {courses.length} courses · 10 checkpoints each
          </div>
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("matrix")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "matrix"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                viewMode === "timeline"
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Timeline
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {viewMode === "timeline" ? (
        <TimelineView courses={courses} />
      ) : (
      <>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-3 font-medium text-gray-700 sticky left-0 bg-white">
                Course
              </th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Term</th>
              <th className="text-left py-3 px-2 font-medium text-gray-700">Faculty</th>
              <th className="text-center py-3 px-2 font-medium text-gray-700">Progress</th>
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
            {courses.map((course) => {
              const progress = getProgress(course.checkpoints);
              return (
                <tr
                  key={course.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-3 sticky left-0 bg-white">
                    <div className="font-medium text-gray-900">{course.code}</div>
                    <div className="text-xs text-gray-500 max-w-[200px] truncate">
                      {course.name}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-gray-600 whitespace-nowrap">
                    {course.term}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`${
                        course.facultyConfirmed ? "text-gray-900" : "text-amber-600"
                      }`}
                    >
                      {course.faculty}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 transition-all"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {progress.completed}/{progress.total}
                      </span>
                    </div>
                  </td>
                  {checkpointOrder.map((key) => (
                    <CheckboxCell
                      key={key}
                      checked={course.checkpoints[key]}
                      onChange={() => toggleCheckpoint(course.id, key)}
                    />
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-3">Checkpoint Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
          {checkpointOrder.map((key, index) => (
            <div key={key} className="flex items-start gap-2">
              <span className="font-medium text-gray-800 w-6">{index + 1}.</span>
              <span>{checkpointLabels[key].full}</span>
            </div>
          ))}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
