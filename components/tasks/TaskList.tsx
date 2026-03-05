"use client";

import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import TaskItem from "@/components/tasks/TaskItem";
import { useToast } from "@/components/ui/ToastProvider";
import {
  TASK_CREATED_EVENT,
  TaskCreatedEventPayload,
} from "@/lib/client-events";
import { TaskListItem, TaskStatus } from "@/lib/types";

type TaskListProps = {
  tasks: TaskListItem[];
  statusFilter?: "all" | TaskStatus;
  meetingScopeId?: string;
};

type PendingDeleteItem = {
  task: TaskListItem;
  index: number;
};

function toDate(value: Date | string): Date {
  return value instanceof Date ? value : new Date(value);
}

function shouldIncludeTask(
  payload: TaskCreatedEventPayload,
  statusFilter: "all" | TaskStatus,
  meetingScopeId?: string,
) {
  const matchesScope = !meetingScopeId || payload.meetingId === meetingScopeId;
  const matchesFilter =
    statusFilter === "all" || payload.status === statusFilter;

  return matchesScope && matchesFilter;
}

export default function TaskList({
  tasks,
  statusFilter = "all",
  meetingScopeId,
}: TaskListProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [taskState, setTaskState] = useState(tasks);
  const [busyTaskIds, setBusyTaskIds] = useState<Record<string, boolean>>({});
  const pendingDeletesRef = useRef<Record<string, PendingDeleteItem>>({});
  const deleteTimeoutsRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setTaskState(tasks);
  }, [tasks]);

  useEffect(() => {
    const timeoutStore = deleteTimeoutsRef.current;

    return () => {
      Object.values(timeoutStore).forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    function handleTaskCreated(event: Event) {
      const customEvent = event as CustomEvent<TaskCreatedEventPayload>;
      const payload = customEvent.detail;

      if (!shouldIncludeTask(payload, statusFilter, meetingScopeId)) {
        return;
      }

      const optimisticTask: TaskListItem = {
        id: payload.id,
        meetingId: payload.meetingId,
        meetingTitle: payload.meeting?.title ?? "Meeting",
        title: payload.title,
        deadline: new Date(payload.deadline),
        status: payload.status,
        createdAt: new Date(payload.createdAt),
      };

      setTaskState((current) => [
        optimisticTask,
        ...current.filter((task) => task.id !== payload.id),
      ]);
    }

    window.addEventListener(TASK_CREATED_EVENT, handleTaskCreated);

    return () => {
      window.removeEventListener(TASK_CREATED_EVENT, handleTaskCreated);
    };
  }, [meetingScopeId, statusFilter]);

  const hasTasks = useMemo(() => taskState.length > 0, [taskState]);

  function markBusy(id: string, isBusy: boolean) {
    setBusyTaskIds((current) => ({ ...current, [id]: isBusy }));
  }

  async function onToggleStatus(id: string) {
    const previous = taskState;
    const currentTask = taskState.find((task) => task.id === id);

    if (!currentTask) {
      return;
    }

    const nextStatus =
      currentTask.status === "completed" ? "pending" : "completed";

    setTaskState((current) =>
      current.map((task) =>
        task.id === id ? { ...task, status: nextStatus } : task,
      ),
    );
    markBusy(id, true);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Unable to update task status");
      }

      pushToast({
        title: nextStatus === "completed" ? "Task completed" : "Task reopened",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      setTaskState(previous);
      const message =
        error instanceof Error ? error.message : "Unable to update task status";
      pushToast({
        title: "Task update failed",
        description: message,
        variant: "error",
      });
    } finally {
      markBusy(id, false);
    }
  }

  async function onDelete(id: string) {
    if (pendingDeletesRef.current[id]) {
      return;
    }

    const taskToDelete = taskState.find((task) => task.id === id);
    if (!taskToDelete) {
      return;
    }

    const index = taskState.findIndex((task) => task.id === id);
    pendingDeletesRef.current[id] = { task: taskToDelete, index };

    setTaskState((current) => current.filter((task) => task.id !== id));

    const finalizeDelete = async () => {
      delete deleteTimeoutsRef.current[id];

      try {
        const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Unable to delete task");
        }

        delete pendingDeletesRef.current[id];
        pushToast({ title: "Task deleted", variant: "success" });
        router.refresh();
      } catch (error) {
        const pending = pendingDeletesRef.current[id];
        if (pending) {
          setTaskState((current) => {
            const next = [...current];
            next.splice(Math.min(pending.index, next.length), 0, pending.task);
            return next;
          });
          delete pendingDeletesRef.current[id];
        }

        const message =
          error instanceof Error ? error.message : "Unable to delete task";
        pushToast({
          title: "Task delete failed",
          description: message,
          variant: "error",
        });
      }
    };

    const timeoutId = window.setTimeout(finalizeDelete, 4500);
    deleteTimeoutsRef.current[id] = timeoutId;

    pushToast({
      title: "Task removed",
      description: "Task will be permanently deleted shortly.",
      variant: "info",
      actionLabel: "Undo",
      durationMs: 4500,
      onAction: () => {
        const pending = pendingDeletesRef.current[id];

        if (!pending) {
          return;
        }

        window.clearTimeout(deleteTimeoutsRef.current[id]);
        delete deleteTimeoutsRef.current[id];

        setTaskState((current) => {
          const next = [...current];
          next.splice(Math.min(pending.index, next.length), 0, pending.task);
          return next;
        });

        delete pendingDeletesRef.current[id];
        pushToast({ title: "Deletion undone", variant: "success" });
      },
    });
  }

  async function onSave(
    id: string,
    payload: { title: string; deadline: string },
  ) {
    const previous = taskState;

    setTaskState((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              title: payload.title,
              deadline: new Date(payload.deadline),
            }
          : task,
      ),
    );
    markBusy(id, true);

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Unable to update task");
      }

      pushToast({ title: "Task updated", variant: "success" });
      router.refresh();
    } catch (error) {
      setTaskState(previous);
      const message =
        error instanceof Error ? error.message : "Unable to update task";
      pushToast({
        title: "Task update failed",
        description: message,
        variant: "error",
      });
    } finally {
      markBusy(id, false);
    }
  }

  if (!hasTasks) {
    return (
      <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
        No tasks found.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {taskState.map((task) => (
        <TaskItem
          key={task.id}
          id={task.id}
          title={task.title}
          meetingTitle={task.meetingTitle}
          status={task.status}
          isBusy={Boolean(busyTaskIds[task.id])}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          onSave={onSave}
          deadline={format(toDate(task.deadline), "yyyy-MM-dd")}
        />
      ))}
    </div>
  );
}
