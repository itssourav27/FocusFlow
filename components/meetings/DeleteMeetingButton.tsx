"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useToast } from "@/components/ui/ToastProvider";
import { TASKS_CHANGED_EVENT } from "@/lib/client-events";

type DeleteMeetingButtonProps = {
  meetingId: string;
};

export default function DeleteMeetingButton({
  meetingId,
}: DeleteMeetingButtonProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [isPendingDelete, setIsPendingDelete] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function cancelDelete() {
    if (!timeoutRef.current) {
      return;
    }

    window.clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsPendingDelete(false);
    pushToast({ title: "Deletion undone", variant: "success" });
  }

  function handleDelete() {
    if (isPendingDelete) {
      return;
    }

    setIsPendingDelete(true);

    const finalizeDelete = async () => {
      timeoutRef.current = null;

      try {
        const response = await fetch(`/api/meetings/${meetingId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Unable to delete meeting");
        }

        pushToast({ title: "Meeting deleted", variant: "success" });
        window.dispatchEvent(new Event(TASKS_CHANGED_EVENT));
        router.push("/meetings");
        router.refresh();
      } catch (error) {
        setIsPendingDelete(false);
        const message =
          error instanceof Error ? error.message : "Unable to delete meeting";
        pushToast({
          title: "Meeting delete failed",
          description: message,
          variant: "error",
        });
      }
    };

    timeoutRef.current = window.setTimeout(finalizeDelete, 4500);

    pushToast({
      title: "Meeting scheduled for deletion",
      description: "Meeting and related tasks will be removed shortly.",
      variant: "info",
      actionLabel: "Undo",
      durationMs: 4500,
      onAction: cancelDelete,
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPendingDelete}
      className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60"
    >
      {isPendingDelete ? "Pending delete..." : "Delete Meeting"}
    </button>
  );
}
