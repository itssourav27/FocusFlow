"use client";

import { useState } from "react";

const STORAGE_KEY = "focusflow.tasks.urgency-legend.hidden";

export default function UrgencyLegend() {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }

    return window.localStorage.getItem(STORAGE_KEY) !== "true";
  });

  function dismissLegend() {
    setIsVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  }

  function showLegend() {
    setIsVisible(true);
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (!isVisible) {
    return (
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={showLegend}
          className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
        >
          Show urgency legend
        </button>
      </div>
    );
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
      <span className="font-medium text-slate-700">Urgency legend:</span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-700">
          Due soon
        </span>
        <span>Due within 3 days</span>
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-700">
          Overdue
        </span>
        <span>Past deadline</span>
      </span>
      <button
        type="button"
        onClick={dismissLegend}
        className="ml-auto rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-500 transition hover:text-slate-900"
      >
        Dismiss
      </button>
    </div>
  );
}
