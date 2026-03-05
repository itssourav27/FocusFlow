"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";

import {
  TASK_CREATED_EVENT,
  TASKS_CHANGED_EVENT,
} from "@/lib/client-events";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/meetings", label: "Meetings" },
  { href: "/tasks", label: "Tasks" },
  { href: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [overdueCount, setOverdueCount] = useState<number | null>(null);
  const isRefreshingRef = useRef(false);
  const hasPendingRefreshRef = useRef(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    let isActive = true;

    async function refreshCounts() {
      if (!isActive) {
        return;
      }

      if (isRefreshingRef.current) {
        hasPendingRefreshRef.current = true;
        return;
      }

      isRefreshingRef.current = true;
      const controller = new AbortController();
      controllerRef.current = controller;

      try {
        const response = await fetch("/api/tasks/counts", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { overdue?: number };
        if (isActive && typeof data.overdue === "number") {
          setOverdueCount(data.overdue);
        }
      } catch {
        // Keep navbar usable even if count fetch fails.
      } finally {
        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }
        isRefreshingRef.current = false;

        if (isActive && hasPendingRefreshRef.current) {
          hasPendingRefreshRef.current = false;
          void refreshCounts();
        }
      }
    }

    refreshCounts();
    window.addEventListener(TASK_CREATED_EVENT, refreshCounts);
    window.addEventListener(TASKS_CHANGED_EVENT, refreshCounts);
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void refreshCounts();
      }
    };
    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);
    const intervalId = window.setInterval(refreshCounts, 60000);

    return () => {
      isActive = false;
      hasPendingRefreshRef.current = false;
      controllerRef.current?.abort();
      controllerRef.current = null;
      window.removeEventListener(TASK_CREATED_EVENT, refreshCounts);
      window.removeEventListener(TASKS_CHANGED_EVENT, refreshCounts);
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          FocusFlow
        </Link>

        <ul className="flex items-center gap-1 rounded-full bg-slate-100 p-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{item.label}</span>
                  {item.href === "/tasks" && overdueCount && overdueCount > 0 ? (
                    <span
                      className={`ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {overdueCount}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}

          {overdueCount && overdueCount > 0 ? (
            <Suspense
              fallback={
                <li>
                  <Link
                    href="/tasks?status=overdue"
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-rose-700 transition-colors hover:bg-rose-100 sm:px-4"
                  >
                    Overdue
                  </Link>
                </li>
              }
            >
              <OverdueQuickLink pathname={pathname} />
            </Suspense>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}

function OverdueQuickLink({ pathname }: { pathname: string }) {
  const searchParams = useSearchParams();
  const isOverdueView =
    pathname === "/tasks" && searchParams.get("status") === "overdue";

  return (
    <li>
      <Link
        href="/tasks?status=overdue"
        className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors sm:px-4 ${
          isOverdueView
            ? "bg-rose-600 text-white shadow-sm"
            : "text-rose-700 hover:bg-rose-100"
        }`}
      >
        Overdue
      </Link>
    </li>
  );
}
