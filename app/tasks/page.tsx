import Link from "next/link";

import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { isTaskStatus } from "@/lib/constants";
import { getMeetings } from "@/lib/meetings";
import { getTasks } from "@/lib/tasks";

export const dynamic = "force-dynamic";

type TasksPageProps = {
  searchParams?: {
    status?: string;
  };
};

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
] as const;

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const statusParam = searchParams?.status;
  const selectedFilter = statusParam && isTaskStatus(statusParam) ? statusParam : "all";

  const [tasks, meetings] = await Promise.all([
    selectedFilter === "all" ? getTasks() : getTasks(selectedFilter),
    getMeetings(),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Tasks</h1>
        <p className="mt-2 text-sm text-slate-500">View, edit, and complete action items across meetings.</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <TaskForm meetings={meetings.map((meeting) => ({ id: meeting.id, title: meeting.title }))} />

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {filters.map((filter) => {
              const isActive = selectedFilter === filter.value;

              return (
                <Link
                  key={filter.value}
                  href={filter.value === "all" ? "/tasks" : `/tasks?status=${filter.value}`}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>

          <TaskList tasks={tasks} statusFilter={selectedFilter} />
        </div>
      </section>
    </main>
  );
}
