"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import {
  TASK_CREATED_EVENT,
  TASKS_CHANGED_EVENT,
  TaskCreatedEventPayload,
} from "@/lib/client-events";
import { useToast } from "@/components/ui/ToastProvider";

type TaskFormMeetingOption = {
  id: string;
  title: string;
};

type TaskFormProps = {
  meetings: TaskFormMeetingOption[];
  defaultMeetingId?: string;
};

export default function TaskForm({
  meetings,
  defaultMeetingId,
}: TaskFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [meetingId, setMeetingId] = useState(
    defaultMeetingId ?? meetings[0]?.id ?? "",
  );
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          title,
          deadline,
          status: "pending",
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Unable to save task");
      }

      const task = (await response
        .json()
        .catch(() => null)) as TaskCreatedEventPayload | null;

      setTitle("");
      setDeadline("");

      if (task && typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent<TaskCreatedEventPayload>(TASK_CREATED_EVENT, {
            detail: task,
          }),
        );
        window.dispatchEvent(new Event(TASKS_CHANGED_EVENT));
      }

      pushToast({ title: "Task created", variant: "success" });
      router.refresh();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Unable to save task";
      setError(message);
      pushToast({
        title: "Task save failed",
        description: message,
        variant: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold text-slate-900">New Task</h2>

      {meetings.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          Create a meeting first before adding tasks.
        </p>
      ) : null}

      <div>
        <label
          htmlFor="task-meeting"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Meeting
        </label>
        <select
          id="task-meeting"
          required
          disabled={meetings.length === 0}
          value={meetingId}
          onChange={(event) => setMeetingId(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
        >
          {meetings.map((meeting) => (
            <option key={meeting.id} value={meeting.id}>
              {meeting.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="task-title"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Task Title
        </label>
        <input
          id="task-title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
          placeholder="Send follow-up summary"
        />
      </div>

      <div>
        <label
          htmlFor="task-deadline"
          className="mb-1 block text-sm font-medium text-slate-700"
        >
          Deadline
        </label>
        <input
          id="task-deadline"
          type="date"
          required
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting || meetings.length === 0}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : "Add Task"}
      </button>
    </form>
  );
}
