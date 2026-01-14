"use client";

import React from "react";
import { Course, CourseCheckpoints } from "@/hooks/useCourses";

interface TimelineViewProps {
  courses: Course[];
}

const checkpointLabels: Record<keyof CourseCheckpoints, { short: string; full: string }> = {
  securedTeacher: { short: "Teacher", full: "Secure teacher & share resource doc" },
  contractSigned: { short: "Contract", full: "Contract signed/countersigned/filed" },
  inBannerCanvas: { short: "Banner", full: "Teacher in Banner and Canvas" },
  stelarTemplate: { short: "STELAR", full: "STELAR template & partner (6 mo before)" },
  bookAdoptions: { short: "Books", full: "Book adoptions submitted" },
  shellComplete: { short: "Shell", full: "Shell complete to STELAR standards" },
  materialsDocumented: { short: "Materials", full: "Pre-existing materials documented" },
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

// Parse term string into comparable date
function termToDate(term: string): Date {
  const [year, season] = term.split(" ");
  const seasonOrder: Record<string, number> = {
    "Spring A": 1, "Spring B": 2,
    "Summer A": 3, "Summer B": 4,
    "Fall A": 5, "Fall B": 6,
  };
  const seasonKey = `${season}`;
  const month = (seasonOrder[term.replace(`${year} `, "")] || 1) * 2;
  return new Date(parseInt(year), month - 1, 1);
}

// Get current academic term
function getCurrentTerm(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Rough mapping: Jan-Feb = Spring A, Mar-Apr = Spring B, May-Jun = Summer A, Jul-Aug = Summer B, Sep-Oct = Fall A, Nov-Dec = Fall B
  if (month <= 1) return `${year} Spring A`;
  if (month <= 3) return `${year} Spring B`;
  if (month <= 5) return `${year} Summer A`;
  if (month <= 7) return `${year} Summer B`;
  if (month <= 9) return `${year} Fall A`;
  return `${year} Fall B`;
}

function getProgress(checkpoints: CourseCheckpoints) {
  const total = Object.keys(checkpoints).length;
  const completed = Object.values(checkpoints).filter(Boolean).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}

function getNextCheckpoints(checkpoints: CourseCheckpoints): string[] {
  const incomplete: string[] = [];
  for (const key of checkpointOrder) {
    if (!checkpoints[key]) {
      incomplete.push(checkpointLabels[key].short);
      if (incomplete.length >= 2) break;
    }
  }
  return incomplete;
}

function getStatusColor(course: Course, currentTerm: string): string {
  const progress = getProgress(course.checkpoints);
  const courseDate = termToDate(course.term);
  const currentDate = termToDate(currentTerm);
  const isPast = courseDate < currentDate;
  const isCurrent = course.term === currentTerm;

  if (progress.percent === 100) return "bg-green-100 border-green-300";
  if (isCurrent) return "bg-blue-100 border-blue-300";
  if (isPast && progress.percent < 100) return "bg-amber-100 border-amber-300";
  if (progress.percent > 50) return "bg-green-50 border-green-200";
  return "bg-gray-50 border-gray-200";
}

export default function TimelineView({ courses }: TimelineViewProps) {
  const currentTerm = getCurrentTerm();

  // Group courses by academic year
  const coursesByYear: Record<string, Course[]> = {};
  courses.forEach(course => {
    const year = course.term.split(" ")[0];
    if (!coursesByYear[year]) coursesByYear[year] = [];
    coursesByYear[year].push(course);
  });

  const years = Object.keys(coursesByYear).sort();

  // Find courses needing attention (upcoming with incomplete checkpoints)
  const needsAttention = courses.filter(course => {
    const courseDate = termToDate(course.term);
    const now = new Date();
    const threeMonthsOut = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const progress = getProgress(course.checkpoints);
    return courseDate <= threeMonthsOut && courseDate >= now && progress.percent < 100;
  });

  return (
    <div className="space-y-6">
      {/* Upcoming Reminders */}
      {needsAttention.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-medium text-amber-800 mb-3">Upcoming Checkpoints</h3>
          <div className="space-y-2">
            {needsAttention.map(course => {
              const next = getNextCheckpoints(course.checkpoints);
              return (
                <div key={course.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-amber-900">{course.code}</span>
                    <span className="text-amber-700 ml-2">({course.term})</span>
                  </div>
                  <div className="text-amber-600">
                    Next: {next.join(", ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Timeline by Year */}
      {years.map(year => (
        <div key={year} className="space-y-3">
          <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">
            Academic Year {year}-{parseInt(year) + 1}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {coursesByYear[year].map(course => {
              const progress = getProgress(course.checkpoints);
              const nextCheckpoints = getNextCheckpoints(course.checkpoints);
              const statusColor = getStatusColor(course, currentTerm);
              const isCurrent = course.term === currentTerm;

              return (
                <div
                  key={course.id}
                  className={`rounded-lg border-2 p-4 transition-all ${statusColor} ${
                    isCurrent ? "ring-2 ring-blue-400 ring-offset-2" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{course.code}</div>
                      <div className="text-xs text-gray-600 leading-tight">{course.name}</div>
                    </div>
                    {isCurrent && (
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{course.term}</span>
                    <span className="mx-2">·</span>
                    <span className={course.facultyConfirmed ? "" : "text-amber-600"}>
                      {course.faculty}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{progress.completed}/{progress.total}</span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          progress.percent === 100 ? "bg-green-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Next steps */}
                  {nextCheckpoints.length > 0 && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">Next:</span> {nextCheckpoints.join(", ")}
                    </div>
                  )}

                  {progress.percent === 100 && (
                    <div className="text-xs text-green-600 font-medium">
                      All checkpoints complete
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600 pt-4 border-t">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
          <span>Current term</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
          <span>Complete</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-100 border-2 border-amber-300"></div>
          <span>Past due / needs attention</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-50 border-2 border-gray-200"></div>
          <span>Upcoming</span>
        </div>
      </div>
    </div>
  );
}
