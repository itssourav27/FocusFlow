"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsOverview } from "@/lib/types";

type ChartsProps = { overview: AnalyticsOverview };

const STATUS_COLORS = ["#4f46e5", "#cbd5e1"];

export default function Charts({ overview }: ChartsProps) {
  const completionData = [
    { label: "Completed", value: overview.completedTasks },
    { label: "Pending", value: overview.pendingTasks },
  ];

  return (
    <section className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Tasks Completed Weekly
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overview.tasksCompletedWeekly}
              margin={{ left: 4, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="weekLabel"
                tickLine={false}
                axisLine={false}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
              />
              <Bar
                dataKey="completedCount"
                fill="#4f46e5"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Task Completion Rate
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={completionData}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={2}
              >
                {completionData.map((entry, index) => (
                  <Cell
                    key={entry.label}
                    fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-slate-500">
          Overall completion rate: {overview.completionRate}%
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Tasks Per Meeting
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={overview.tasksPerMeeting}
              margin={{ left: 8, right: 8, top: 8, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                vertical={false}
              />
              <XAxis
                dataKey="meetingTitle"
                tickLine={false}
                axisLine={false}
                stroke="#64748b"
                fontSize={12}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                stroke="#64748b"
                fontSize={12}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, borderColor: "#cbd5e1" }}
              />
              <Bar dataKey="taskCount" fill="#1d4ed8" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>
    </section>
  );
}
