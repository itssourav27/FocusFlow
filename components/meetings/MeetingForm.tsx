"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { MEETING_CREATED_EVENT, MeetingCreatedEventPayload } from "@/lib/client-events";
import { useToast } from "@/components/ui/ToastProvider";

type MeetingFormProps = {
  heading?: string;
  initialTitle?: string;
  initialDate?: string;
  initialNotes?: string;
  endpoint?: string;
  method?: "POST" | "PATCH";
  buttonLabel?: string;
};

export default function MeetingForm({
  heading = "New Meeting",
  initialTitle = "",
  initialDate = "",
  initialNotes = "",
  endpoint = "/api/meetings",
  method = "POST",
  buttonLabel = "Save Meeting",
}: MeetingFormProps) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [title, setTitle] = useState(initialTitle);
  const [date, setDate] = useState(initialDate);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, date, notes }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Unable to save meeting");
      }

      const meeting = (await response.json().catch(() => null)) as MeetingCreatedEventPayload | null;

      if (method === "POST") {
        setTitle("");
        setDate("");
        setNotes("");

        if (meeting && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent<MeetingCreatedEventPayload>(MEETING_CREATED_EVENT, { detail: meeting }));
        }
      }

      pushToast({
        title: method === "POST" ? "Meeting created" : "Meeting updated",
        variant: "success",
      });

      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "Unable to save meeting";
      setError(message);
      pushToast({ title: "Meeting save failed", description: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{heading}</h2>

      <div>
        <label htmlFor="meeting-title" className="mb-1 block text-sm font-medium text-slate-700">
          Title
        </label>
        <input
          id="meeting-title"
          type="text"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
          placeholder="Sprint planning"
        />
      </div>

      <div>
        <label htmlFor="meeting-date" className="mb-1 block text-sm font-medium text-slate-700">
          Date
        </label>
        <input
          id="meeting-date"
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
        />
      </div>

      <div>
        <label htmlFor="meeting-notes" className="mb-1 block text-sm font-medium text-slate-700">
          Notes
        </label>
        <textarea
          id="meeting-notes"
          rows={4}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
          placeholder="Discussion notes and outcomes"
        />
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Saving..." : buttonLabel}
      </button>
    </form>
  );
}
