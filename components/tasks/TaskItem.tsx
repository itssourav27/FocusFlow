"use client";

import { FormEvent, useState } from "react";

import { TaskStatus } from "@/lib/types";

type TaskItemProps = {
  id: string;
  deadline: string;
  meetingTitle: string;
  title: string;
  status: TaskStatus;
  isOverdue: boolean;
  isBusy: boolean;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, payload: { title: string; deadline: string }) => void;
};

export default function TaskItem({
  id,
  title,
  deadline,
  meetingTitle,
  status,
  isOverdue,
  isBusy,
  onToggleStatus,
  onDelete,
  onSave,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [nextTitle, setNextTitle] = useState(title);
  const [nextDeadline, setNextDeadline] = useState(deadline);

  function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(id, { title: nextTitle, deadline: nextDeadline });
    setIsEditing(false);
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`text-sm font-medium ${status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}`}
          >
            {title}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {meetingTitle} • Due {deadline}
          </p>
          {isOverdue ? (
            <span className="mt-2 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
              Overdue
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onToggleStatus(id)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {status === "completed" ? "Reopen" : "Complete"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => setIsEditing((current) => !current)}
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onDelete(id)}
            className="rounded-lg border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>

      {isEditing ? (
        <form
          onSubmit={saveChanges}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_180px_auto]"
        >
          <input
            type="text"
            required
            value={nextTitle}
            onChange={(event) => setNextTitle(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
          />
          <input
            type="date"
            required
            value={nextDeadline}
            onChange={(event) => setNextDeadline(event.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
          >
            Save
          </button>
        </form>
      ) : null}
    </div>
  );
}
