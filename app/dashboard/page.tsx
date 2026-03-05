import DashboardCards from "@/components/dashboard/DashboardCards";
import TasksByWeekChart from "@/components/charts/TasksByWeekChart";
import { getDashboardOverview } from "@/lib/dashboard";
import { DashboardStat } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const overview = await getDashboardOverview();

  const stats: DashboardStat[] = [
    {
      label: "Total Meetings",
      value: overview.totalMeetings,
      href: "/meetings",
    },
    { label: "Total Tasks", value: overview.totalTasks, href: "/tasks" },
    {
      label: "Pending Tasks",
      value: overview.pendingTasks,
      href: "/tasks?status=pending",
    },
    {
      label: "Due Soon",
      value: overview.dueSoonTasks,
      helperText: "Pending tasks due in 3 days",
      href: "/tasks?status=due-soon",
    },
    {
      label: "Overdue Tasks",
      value: overview.overdueTasks,
      helperText: "Pending tasks past deadline",
      href: "/tasks?status=overdue",
    },
    {
      label: "Completed Tasks",
      value: overview.completedTasks,
      href: "/tasks?status=completed",
    },
    {
      label: "Completion Rate",
      value: `${overview.completionRate}%`,
      helperText: "Completed tasks / total tasks",
      href: "/analytics",
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Track your meetings and action items at a glance.
        </p>
      </div>

      <DashboardCards stats={stats} />

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Tasks Completed Per Week
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Last 6 weeks based on completed task creation date.
          </p>
        </header>
        <TasksByWeekChart data={overview.weeklyCompletedTasks} />
      </section>
    </main>
  );
}
