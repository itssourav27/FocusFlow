import Link from "next/link";

import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import TaskViewPreferences from "@/components/tasks/TaskViewPreferences";
import { isTaskStatus } from "@/lib/constants";
import { getMeetings } from "@/lib/meetings";
import {
  getTaskFilterCounts,
  getTasks,
  TaskFilter,
  TaskSort,
} from "@/lib/tasks";

export const dynamic = "force-dynamic";

type TasksPageProps = {
  searchParams?: {
    status?: string;
    sort?: string;
    q?: string;
  };
};

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Overdue", value: "overdue" },
] as const;

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Deadline (Soonest)", value: "deadline-asc" },
  { label: "Deadline (Latest)", value: "deadline-desc" },
] as const;

function isTaskFilter(value: string): value is TaskFilter {
  return value === "all" || value === "overdue" || isTaskStatus(value);
}

function isTaskSort(value: string): value is TaskSort {
  return (
    value === "newest" ||
    value === "oldest" ||
    value === "deadline-asc" ||
    value === "deadline-desc"
  );
}

function getDefaultSort(filter: TaskFilter): TaskSort {
  return filter === "overdue" ? "deadline-asc" : "newest";
}

function getTasksHref(filter: TaskFilter, sort: TaskSort, query: string): string {
  const params = new URLSearchParams();

  if (filter !== "all") {
    params.set("status", filter);
  }

  if (sort !== getDefaultSort(filter)) {
    params.set("sort", sort);
  }

  if (query) {
    params.set("q", query);
  }

  const queryString = params.toString();
  return queryString ? `/tasks?${queryString}` : "/tasks";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const statusParam = searchParams?.status;
  const sortParam = searchParams?.sort;
  const searchQuery = searchParams?.q?.trim() ?? "";
  const selectedFilter =
    statusParam && isTaskFilter(statusParam) ? statusParam : "all";
  const selectedSort =
    sortParam && isTaskSort(sortParam)
      ? sortParam
      : getDefaultSort(selectedFilter);
  const defaultSortForFilter = getDefaultSort(selectedFilter);
  const isCustomSort = selectedSort !== defaultSortForFilter;

  const [tasks, meetings, counts] = await Promise.all([
    getTasks(selectedFilter, selectedSort, searchQuery),
    getMeetings(),
    getTaskFilterCounts(),
  ]);

  const resultLabel = tasks.length === 1 ? "task" : "tasks";
  const filterLabel =
    selectedFilter === "all"
      ? "all"
      : selectedFilter === "overdue"
        ? "overdue"
        : selectedFilter;

  const emptyStateMessage = searchQuery
    ? `No tasks found for "${searchQuery}".`
    : selectedFilter === "all"
      ? "No tasks found."
      : `No ${filterLabel} tasks found.`;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <TaskViewPreferences />

      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Tasks
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          View, edit, and complete action items across meetings.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <TaskForm
          meetings={meetings.map((meeting) => ({
            id: meeting.id,
            title: meeting.title,
          }))}
        />

        <div>
          <form method="GET" action="/tasks" className="mb-4 flex gap-2">
            {selectedFilter !== "all" ? (
              <input type="hidden" name="status" value={selectedFilter} />
            ) : null}
            {selectedSort !== getDefaultSort(selectedFilter) ? (
              <input type="hidden" name="sort" value={selectedSort} />
            ) : null}
            <input
              type="search"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search tasks or meeting title"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-indigo-500 transition focus:ring"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Search
            </button>
            {searchQuery ? (
              <Link
                href={getTasksHref(selectedFilter, selectedSort, "")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Clear
              </Link>
            ) : null}
          </form>

          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => {
                const isActive = selectedFilter === filter.value;

                return (
                  <Link
                    key={filter.value}
                    href={getTasksHref(filter.value, selectedSort, searchQuery)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      isActive
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {filter.label} ({counts[filter.value]})
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Sort:</span>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => {
                  const isActive = selectedSort === option.value;
                  const isDefaultForFilter =
                    option.value === getDefaultSort(selectedFilter);

                  return (
                    <Link
                      key={option.value}
                      href={getTasksHref(
                        selectedFilter,
                        option.value,
                        searchQuery,
                      )}
                      aria-label={
                        isDefaultForFilter
                          ? `${option.label} (default for current filter)`
                          : option.label
                      }
                      className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                        isActive
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {option.label}
                      {isActive && isDefaultForFilter ? (
                        <span className="ml-1.5 text-xs opacity-80">default</span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>

              {isCustomSort ? (
                <Link
                  href={getTasksHref(
                    selectedFilter,
                    defaultSortForFilter,
                    searchQuery,
                  )}
                  className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                >
                  Reset view
                </Link>
              ) : (
                <span className="px-1 text-xs text-slate-400">Default view</span>
              )}
            </div>
          </div>

          <p className="mb-3 text-sm text-slate-500">
            Showing {tasks.length} {resultLabel}
            {selectedFilter !== "all" ? ` in ${filterLabel}` : ""}
            {searchQuery ? ` for "${searchQuery}"` : ""}.
          </p>

          <TaskList
            tasks={tasks}
            statusFilter={selectedFilter}
            emptyStateMessage={emptyStateMessage}
          />
        </div>
      </section>
    </main>
  );
}
