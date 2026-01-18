"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTasks, Task } from "@/hooks/useTasks";

export type { Task };

const statusConfig = {
  not_started: { bg: "bg-gray-100", text: "text-gray-600", label: "Not Started" },
  in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
  launched: { bg: "bg-green-100", text: "text-green-700", label: "Launched" },
};

const statusOrder: Task["status"][] = ["not_started", "in_progress", "launched"];

interface SortableTaskProps {
  task: Task;
  onStatusChange: (id: string) => void;
  onEdit: (task: Task) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

function SortableTask({ task, onStatusChange, onEdit, isExpanded, onToggleExpand }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const status = statusConfig[task.status];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg p-3 mb-2 shadow-sm border border-gray-100 ${
        isDragging ? "shadow-lg opacity-90" : "hover:shadow-md"
      } transition-shadow`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => task.notes && onToggleExpand(task.id)}
              className={`text-sm text-gray-800 text-left ${task.notes ? "cursor-pointer hover:text-gray-600" : ""}`}
            >
              {task.title}
              {task.notes && (
                <svg
                  className={`w-3 h-3 inline-block ml-1 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onStatusChange(task.id)}
              className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} hover:opacity-80 transition-opacity`}
              title="Click to change status"
            >
              {status.label}
            </button>
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                title={task.link}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {task.notes && isExpanded && (
            <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">{task.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Non-draggable task component for launched/archived tasks
interface ArchivedTaskProps {
  task: Task;
  onStatusChange: (id: string) => void;
  onEdit: (task: Task) => void;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
}

function ArchivedTask({ task, onStatusChange, onEdit, isExpanded, onToggleExpand }: ArchivedTaskProps) {
  const status = statusConfig[task.status];

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-2 border border-gray-200">
      <div className="flex items-start gap-2">
        {/* Placeholder for alignment (no drag handle) */}
        <div className="mt-0.5 p-1 w-6" />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <button
              onClick={() => task.notes && onToggleExpand(task.id)}
              className={`text-sm text-gray-600 text-left ${task.notes ? "cursor-pointer hover:text-gray-500" : ""}`}
            >
              {task.title}
              {task.notes && (
                <svg
                  className={`w-3 h-3 inline-block ml-1 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-1 text-gray-400 hover:text-gray-600 shrink-0"
              title="Edit"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onStatusChange(task.id)}
              className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.text} hover:opacity-80 transition-opacity`}
              title="Click to reactivate"
            >
              {status.label}
            </button>
            {task.link && (
              <a
                href={task.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
                title={task.link}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>

          {task.notes && isExpanded && (
            <p className="text-xs text-gray-500 mt-2 whitespace-pre-wrap">{task.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface TaskEditModalProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
  onDelete: (id: string) => void;
}

function TaskEditModal({ task, onClose, onSave, onDelete }: TaskEditModalProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [notes, setNotes] = useState(task?.notes || "");
  const [link, setLink] = useState(task?.link || "");
  const [status, setStatus] = useState<Task["status"]>(task?.status || "not_started");

  if (!task) return null;

  const handleSave = () => {
    onSave({ ...task, title, notes, link, status });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg p-4 w-96 max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold mb-4">Edit Task</h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task["status"])}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="launched">Launched</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Link (optional)</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-between mt-4 pt-3 border-t">
          <button
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskPanelProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function TaskPanel({ isCollapsed, onToggle }: TaskPanelProps) {
  const { tasks, setTasks, isLoading, error, isSaving } = useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [allExpanded, setAllExpanded] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  // Split tasks into active and launched
  const activeTasks = tasks.filter((t) => t.status !== "launched");
  const launchedTasks = tasks.filter((t) => t.status === "launched");

  const handleToggleExpand = (id: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedTasks(new Set());
      setAllExpanded(false);
    } else {
      const tasksWithNotes = tasks.filter((t) => t.notes).map((t) => t.id);
      setExpandedTasks(new Set(tasksWithNotes));
      setAllExpanded(true);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // Only reorder within active tasks
      const oldIndex = activeTasks.findIndex((i) => i.id === active.id);
      const newIndex = activeTasks.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedActive = arrayMove(activeTasks, oldIndex, newIndex);
        // Combine reordered active tasks with launched tasks
        setTasks([...reorderedActive, ...launchedTasks]);
      }
    }
  };

  const handleStatusChange = (id: string) => {
    setTasks(
      tasks.map((item) => {
        if (item.id === id) {
          const currentIndex = statusOrder.indexOf(item.status);
          const nextIndex = (currentIndex + 1) % statusOrder.length;
          return { ...item, status: statusOrder[nextIndex] };
        }
        return item;
      })
    );
  };

  const handleSaveTask = (updatedTask: Task) => {
    setTasks(
      tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item))
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((item) => item.id !== id));
  };

  const handleAddTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: "New Task",
      status: "not_started",
    };
    setTasks([...tasks, newTask]);
    setEditingTask(newTask);
  };

  if (isCollapsed) {
    return (
      <div className="w-12 border-r border-gray-200 bg-gray-50 flex flex-col items-center py-4">
        <button
          onClick={onToggle}
          className="p-2 hover:bg-gray-200 rounded-lg mb-4"
          title="Expand Tasks"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div className="writing-vertical text-xs text-gray-500 font-medium">
          Tasks ({activeTasks.length})
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">Tasks ({activeTasks.length})</h2>
          <button
            onClick={handleToggleAll}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
            title={allExpanded ? "Collapse all" : "Expand all"}
          >
            <svg className={`w-4 h-4 transition-transform ${allExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isSaving && (
            <span className="text-xs text-gray-400">Saving...</span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-200 rounded"
          title="Collapse"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="px-3 py-2 bg-red-50 border-b border-red-100">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-sm text-gray-400">Loading tasks...</span>
          </div>
        ) : (
        <>
          {/* Active tasks (draggable) */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={activeTasks} strategy={verticalListSortingStrategy}>
              {activeTasks.map((task) => (
                <SortableTask
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </SortableContext>
          </DndContext>

          {/* Completed section divider */}
          {launchedTasks.length > 0 && (
            <>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="w-full flex items-center gap-2 py-2 px-3 mt-2 mb-2 text-sm text-gray-500 hover:text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showCompleted ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Completed ({launchedTasks.length})</span>
              </button>

              {/* Launched tasks (non-draggable) */}
              {showCompleted && launchedTasks.map((task) => (
                <ArchivedTask
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={setEditingTask}
                  isExpanded={expandedTasks.has(task.id)}
                  onToggleExpand={handleToggleExpand}
                />
              ))}
            </>
          )}
        </>
        )}
      </div>

      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleAddTask}
          className="w-full text-sm text-gray-600 hover:text-gray-800 py-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
        >
          + Add Task
        </button>
      </div>

      <TaskEditModal
        key={editingTask?.id || "new"}
        task={editingTask}
        onClose={() => setEditingTask(null)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
      />
    </div>
  );
}
