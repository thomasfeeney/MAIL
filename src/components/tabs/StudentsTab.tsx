"use client";

import React, { useState, useMemo } from "react";
import { useStudents, Student, ALL_COURSES } from "@/hooks/useStudents";

const STATUS_OPTIONS: { value: Student["status"]; label: string; color: string }[] = [
  { value: "active", label: "Active", color: "bg-green-100 text-green-800" },
  { value: "paused", label: "Paused", color: "bg-yellow-100 text-yellow-800" },
  { value: "probation", label: "Probation", color: "bg-red-100 text-red-800" },
  { value: "withdrawn", label: "Withdrawn", color: "bg-gray-100 text-gray-600" },
  { value: "graduated", label: "Graduated", color: "bg-blue-100 text-blue-800" },
];

function StatusBadge({ status }: { status: Student["status"] }) {
  const option = STATUS_OPTIONS.find((o) => o.value === status);
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${option?.color}`}>
      {option?.label}
    </span>
  );
}

function ProgressIndicator({ completed, total }: { completed: number; total: number }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-500">{completed}/{total}</span>
    </div>
  );
}

function StudentEditModal({
  student,
  onSave,
  onDelete,
  onClose,
}: {
  student: Student;
  onSave: (updates: Partial<Student>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [editData, setEditData] = useState<Student>({ ...student });

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Delete this student?")) {
      onDelete();
      onClose();
    }
  };

  const toggleCourse = (course: string) => {
    const current = editData.coursesCompleted || [];
    if (current.includes(course)) {
      setEditData({ ...editData, coursesCompleted: current.filter((c) => c !== course) });
    } else {
      setEditData({ ...editData, coursesCompleted: [...current, course] });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {student.firstName ? "Edit Student" : "New Student"}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={editData.firstName}
                onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={editData.lastName}
                onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editData.email}
                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Start Term
              </label>
              <input
                type="text"
                value={editData.startTerm}
                onChange={(e) => setEditData({ ...editData, startTerm: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 2025 Fall A"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value as Student["status"] })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Benefits Eligible
              </label>
              <select
                value={editData.benefitsEligible ? "yes" : "no"}
                onChange={(e) => setEditData({ ...editData, benefitsEligible: e.target.value === "yes" })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Benefits Start Term
              </label>
              <input
                type="text"
                value={editData.benefitsStartTerm}
                onChange={(e) => setEditData({ ...editData, benefitsStartTerm: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="e.g., 2026 Fall"
                disabled={!editData.benefitsEligible}
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Courses Completed
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ALL_COURSES.map((course) => (
                  <label
                    key={course}
                    className="flex items-center gap-2 px-2 py-1.5 rounded border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={editData.coursesCompleted?.includes(course) || false}
                      onChange={() => toggleCourse(course)}
                      className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{course}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notes
              </label>
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Notes about this student..."
              />
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsTab() {
  const { students, addStudent, updateStudent, deleteStudent, isLoading, error, isSaving } = useStudents();
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [statusFilter, setStatusFilter] = useState<Student["status"] | "all">("all");
  const [sortBy, setSortBy] = useState<"name" | "startTerm" | "status" | "progress">("name");

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        case "startTerm":
          return a.startTerm.localeCompare(b.startTerm);
        case "status":
          return a.status.localeCompare(b.status);
        case "progress":
          return (b.coursesCompleted?.length || 0) - (a.coursesCompleted?.length || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [students, statusFilter, sortBy]);

  // Summary counts
  const counts = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => s.status === "active").length,
      paused: students.filter((s) => s.status === "paused").length,
      probation: students.filter((s) => s.status === "probation").length,
      withdrawn: students.filter((s) => s.status === "withdrawn").length,
      graduated: students.filter((s) => s.status === "graduated").length,
      benefitsEligible: students.filter((s) => s.benefitsEligible).length,
    };
  }, [students]);

  const handleAddStudent = () => {
    const newStudent = addStudent();
    setEditingStudent(newStudent);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Students</h2>
        <p className="text-gray-600 text-sm">
          Track student enrollment, status, and course progress.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-3 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-gray-900">{counts.total}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-green-700">{counts.active}</p>
          <p className="text-xs text-green-600">Active</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-yellow-700">{counts.paused}</p>
          <p className="text-xs text-yellow-600">Paused</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-red-700">{counts.probation}</p>
          <p className="text-xs text-red-600">Probation</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-gray-600">{counts.withdrawn}</p>
          <p className="text-xs text-gray-500">Withdrawn</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-semibold text-blue-700">{counts.graduated}</p>
          <p className="text-xs text-blue-600">Graduated</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Filter:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Student["status"] | "all")}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Students</option>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500">Sort:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="name">Name</option>
              <option value="startTerm">Start Term</option>
              <option value="status">Status</option>
              <option value="progress">Progress</option>
            </select>
          </div>
          {isSaving && <span className="text-xs text-gray-400">Saving...</span>}
        </div>
        <button
          onClick={handleAddStudent}
          className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          + Add Student
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Students Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Start Term</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Benefits</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">Progress</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredAndSortedStudents.map((student) => (
              <tr
                key={student.id}
                onClick={() => setEditingStudent(student)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-gray-900">
                    {student.lastName}, {student.firstName}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">{student.email}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-600">{student.startTerm}</p>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={student.status} />
                </td>
                <td className="px-4 py-3">
                  {student.benefitsEligible ? (
                    <span className="text-xs text-purple-600 font-medium">
                      {student.benefitsStartTerm || "Yes"}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <ProgressIndicator
                    completed={student.coursesCompleted?.length || 0}
                    total={ALL_COURSES.length}
                  />
                </td>
              </tr>
            ))}
            {filteredAndSortedStudents.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        Click a row to edit. Changes save automatically.
      </p>

      {/* Edit Modal */}
      {editingStudent && (
        <StudentEditModal
          student={editingStudent}
          onSave={(updates) => updateStudent(editingStudent.id, updates)}
          onDelete={() => deleteStudent(editingStudent.id)}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}
