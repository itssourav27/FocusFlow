"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const STORAGE_KEY = "focusflow.tasks.view";

type TaskFilter = "all" | "pending" | "completed" | "overdue" | "due-soon";
type TaskSort = "newest" | "oldest" | "deadline-asc" | "deadline-desc";

type TaskViewPreference = {
  status: TaskFilter;
  sort: TaskSort;
  q?: string;
};

function isTaskFilter(value: string | null): value is TaskFilter {
  return (
    value === "all" ||
    value === "pending" ||
    value === "completed" ||
    value === "overdue" ||
    value === "due-soon"
  );
}

function isTaskSort(value: string | null): value is TaskSort {
  return (
    value === "newest" ||
    value === "oldest" ||
    value === "deadline-asc" ||
    value === "deadline-desc"
  );
}

function getDefaultSort(filter: TaskFilter): TaskSort {
  return filter === "overdue" || filter === "due-soon"
    ? "deadline-asc"
    : "newest";
}

function getTasksHref(filter: TaskFilter, sort: TaskSort, q?: string): string {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("status", filter);
  }

  if (sort !== getDefaultSort(filter)) {
    params.set("sort", sort);
  }

  if (q) {
    params.set("q", q);
  }

  const query = params.toString();
  return query ? `/tasks?${query}` : "/tasks";
}

function normalizePreference(
  status: TaskFilter,
  sort: TaskSort,
  q?: string,
): TaskViewPreference {
  const nextQuery = q?.trim();

  return {
    status,
    sort: isTaskSort(sort) ? sort : getDefaultSort(status),
    q: nextQuery || undefined,
  };
}

export default function TaskViewPreferences() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname !== "/tasks") {
      return;
    }

    const rawStatus = searchParams.get("status");
    const rawSort = searchParams.get("sort");
    const rawQuery = searchParams.get("q")?.trim() ?? "";
    const hasExplicitParams =
      rawStatus !== null || rawSort !== null || rawQuery.length > 0;

    const status = isTaskFilter(rawStatus) ? rawStatus : "all";
    const sort = isTaskSort(rawSort) ? rawSort : getDefaultSort(status);

    if (hasExplicitParams) {
      const nextPreference = normalizePreference(status, sort, rawQuery);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextPreference));
      return;
    }

    const savedRaw = localStorage.getItem(STORAGE_KEY);
    if (!savedRaw) {
      return;
    }

    try {
      const parsed = JSON.parse(savedRaw) as Partial<TaskViewPreference>;
      const parsedStatus = parsed.status ?? null;
      const parsedSort = parsed.sort ?? null;
      const parsedQuery = typeof parsed.q === "string" ? parsed.q.trim() : "";

      const savedStatus = isTaskFilter(parsedStatus) ? parsedStatus : "all";
      const savedSort = isTaskSort(parsedSort)
        ? parsedSort
        : getDefaultSort(savedStatus);

      const targetHref = getTasksHref(savedStatus, savedSort, parsedQuery);
      if (targetHref !== "/tasks") {
        router.replace(targetHref);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [pathname, router, searchParams]);

  return null;
}
