"use client";

import React, { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { useInterviews, Interview, StageNotes } from "@/hooks/useInterviews";

const STAGES = [
  { id: "prospect", label: "Prospect", color: "bg-gray-50 border-gray-200" },
  { id: "contacted", label: "Contacted", color: "bg-blue-50 border-blue-200" },
  { id: "booked", label: "Booked", color: "bg-indigo-50 border-indigo-200" },
  { id: "recorded", label: "Recorded", color: "bg-yellow-50 border-yellow-200" },
  { id: "editing", label: "Editing", color: "bg-orange-50 border-orange-200" },
  { id: "published", label: "Published", color: "bg-green-50 border-green-200" },
] as const;

// --- InterviewCard (draggable) ---
function InterviewCard({
  interview,
  onClick,
}: {
  interview: Interview;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: interview.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const stageDate =
    interview.status === "published"
      ? interview.publishedDate
      : interview.status === "recorded" || interview.status === "editing"
      ? interview.recordedDate
      : interview.status === "booked"
      ? interview.scheduledDate
      : "";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // Only open modal if not dragging
        if (!isDragging) {
          e.stopPropagation();
          onClick();
        }
      }}
      className={`bg-white rounded-lg border border-gray-200 p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <p className="font-medium text-sm text-gray-900 truncate">
        {interview.guestName || "Unnamed Guest"}
      </p>
      {(interview.guestTitle || interview.guestOrganization) && (
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          {[interview.guestTitle, interview.guestOrganization]
            .filter(Boolean)
            .join(" · ")}
        </p>
      )}
      {stageDate && (
        <p className="text-xs text-gray-400 mt-1">{stageDate}</p>
      )}
      {interview.notes && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
          {interview.notes}
        </p>
      )}
    </div>
  );
}

// --- KanbanColumn (droppable) ---
function KanbanColumn({
  stage,
  interviews,
  onCardClick,
}: {
  stage: (typeof STAGES)[number];
  interviews: Interview[];
  onCardClick: (interview: Interview) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-56 rounded-lg border p-2 ${stage.color} ${
        isOver ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
          {stage.label}
        </h4>
        <span className="text-xs text-gray-400 bg-white rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center">
          {interviews.length}
        </span>
      </div>
      <div className="space-y-2 min-h-[60px]">
        {interviews.map((interview) => (
          <InterviewCard
            key={interview.id}
            interview={interview}
            onClick={() => onCardClick(interview)}
          />
        ))}
      </div>
    </div>
  );
}

// --- InterviewEditModal ---
function InterviewEditModal({
  interview,
  onSave,
  onDelete,
  onClose,
}: {
  interview: Interview;
  onSave: (updates: Partial<Interview>) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const [editData, setEditData] = useState<Interview>({ ...interview });

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Delete this guest?")) {
      onDelete();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {interview.guestName ? "Edit Guest" : "New Guest"}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Guest Name
              </label>
              <input
                type="text"
                value={editData.guestName}
                onChange={(e) =>
                  setEditData({ ...editData, guestName: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Full name"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editData.guestTitle}
                onChange={(e) =>
                  setEditData({ ...editData, guestTitle: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Job title"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Organization
              </label>
              <input
                type="text"
                value={editData.guestOrganization}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    guestOrganization: e.target.value,
                  })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Company or org"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editData.guestEmail}
                onChange={(e) =>
                  setEditData({ ...editData, guestEmail: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                LinkedIn
              </label>
              <input
                type="text"
                value={editData.guestLinkedIn}
                onChange={(e) =>
                  setEditData({ ...editData, guestLinkedIn: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="LinkedIn URL"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Status
              </label>
              <select
                value={editData.status}
                onChange={(e) =>
                  setEditData({
                    ...editData,
                    status: e.target.value as Interview["status"],
                  })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Referred By
              </label>
              <input
                type="text"
                value={editData.referredBy}
                onChange={(e) =>
                  setEditData({ ...editData, referredBy: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Who referred them"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Scheduled Date
              </label>
              <input
                type="date"
                value={editData.scheduledDate}
                onChange={(e) =>
                  setEditData({ ...editData, scheduledDate: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Recorded Date
              </label>
              <input
                type="date"
                value={editData.recordedDate}
                onChange={(e) =>
                  setEditData({ ...editData, recordedDate: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Published Date
              </label>
              <input
                type="date"
                value={editData.publishedDate}
                onChange={(e) =>
                  setEditData({ ...editData, publishedDate: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Published URL
              </label>
              <input
                type="text"
                value={editData.publishedUrl}
                onChange={(e) =>
                  setEditData({ ...editData, publishedUrl: e.target.value })
                }
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="YouTube/LinkedIn URL"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Notes
              </label>
              <textarea
                value={editData.notes}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                rows={3}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                placeholder="Notes about this guest..."
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

// --- StageNotesSection ---
function StageNotesSection({
  stageNotes,
  onUpdateNote,
}: {
  stageNotes: StageNotes;
  onUpdateNote: (stage: string, notes: string) => void;
}) {
  return (
    <div className="mb-8">
      <h3 className="font-medium text-gray-700 mb-3">Stage Notes</h3>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {STAGES.map((stage) => (
          <div
            key={stage.id}
            className={`rounded-lg border p-3 ${stage.color}`}
          >
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1.5">
              {stage.label}
            </label>
            <textarea
              value={stageNotes[stage.id] || ""}
              onChange={(e) => onUpdateNote(stage.id, e.target.value)}
              rows={3}
              className="w-full px-2 py-1.5 text-sm bg-white/80 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              placeholder={`Notes for ${stage.label} stage...`}
            />
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Edit these notes to customize your workflow for each stage. Changes save
        automatically.
      </p>
    </div>
  );
}

// --- Main MarketingTab ---
export default function MarketingTab() {
  const {
    interviews,
    addInterview,
    deleteInterview,
    updateInterview,
    stageNotes,
    updateStageNote,
    isLoading,
    error,
    isSaving,
  } = useInterviews();

  const [editingInterview, setEditingInterview] = useState<Interview | null>(
    null
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveId(null);
      const { active, over } = event;
      if (!over) return;

      const interviewId = active.id as string;
      const targetStatus = over.id as Interview["status"];

      const interview = interviews.find((i) => i.id === interviewId);
      if (interview && interview.status !== targetStatus) {
        updateInterview(interviewId, { status: targetStatus });
      }
    },
    [interviews, updateInterview]
  );

  const handleAddInterview = useCallback(() => {
    const newInterview = addInterview();
    setEditingInterview(newInterview);
  }, [addInterview]);

  // Group interviews by status
  const groupedInterviews = STAGES.reduce(
    (acc, stage) => {
      acc[stage.id] = interviews.filter((i) => i.status === stage.id);
      return acc;
    },
    {} as Record<string, Interview[]>
  );

  const activeInterview = activeId
    ? interviews.find((i) => i.id === activeId)
    : null;

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <span className="text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Marketing</h2>
        <p className="text-gray-600 text-sm">
          Video series planning and promotional content coordination.
        </p>
      </div>

      {/* Interview Guest Pipeline */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-medium text-gray-700">
              Interview Guest Pipeline
            </h3>
            {isSaving && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
          </div>
          <button
            onClick={handleAddInterview}
            className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            + Add Guest
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4">
            {STAGES.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                interviews={groupedInterviews[stage.id] || []}
                onCardClick={(interview) => setEditingInterview(interview)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeInterview ? (
              <div className="bg-white rounded-lg border border-blue-300 p-3 shadow-lg w-56 rotate-2">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {activeInterview.guestName || "Unnamed Guest"}
                </p>
                {(activeInterview.guestTitle ||
                  activeInterview.guestOrganization) && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {[
                      activeInterview.guestTitle,
                      activeInterview.guestOrganization,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <p className="mt-3 text-xs text-gray-400">
          Drag guests between stages. Click a card to edit details. Changes save
          automatically.
        </p>
      </div>

      {/* Stage Notes */}
      <StageNotesSection
        stageNotes={stageNotes}
        onUpdateNote={updateStageNote}
      />

      {/* Info Sessions Section */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-medium text-gray-700 mb-3">Info Sessions</h3>
        <div className="grid grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Monthly Schedule
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>1 per month (standard)</li>
              <li>2 in January, August</li>
              <li>3 in March/April, October/November</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Session Times
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>12:00 PM (default)</li>
              <li>6:00 PM (evening option)</li>
              <li>8:00 AM (international)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-2">
              Spring In-Person Event
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Book room via 25Live (note ASC restrictions)</li>
              <li>Order catering 2 months ahead</li>
              <li>TommieLink, Digital Signage, Posters</li>
              <li>CAS Social Media (Adam)</li>
              <li>OneStThomas &amp; MAIL Sessions page</li>
              <li>Canvas announcement + Padlet</li>
              <li>Invite MAIL students to attend</li>
              <li>Consider classroom visits (CAS courses)</li>
              <li>UST Family Portal post (optional)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingInterview && (
        <InterviewEditModal
          interview={editingInterview}
          onSave={(updates) => updateInterview(editingInterview.id, updates)}
          onDelete={() => deleteInterview(editingInterview.id)}
          onClose={() => setEditingInterview(null)}
        />
      )}
    </div>
  );
}
