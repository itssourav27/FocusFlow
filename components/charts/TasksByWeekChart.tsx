"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WeeklyCompletionDatum } from "@/lib/types";

type TasksByWeekChartProps = {
  data: WeeklyCompletionDatum[];
};

export default function TasksByWeekChart({ data }: TasksByWeekChartProps) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
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
            cursor={{ fill: "rgba(79, 70, 229, 0.08)" }}
          />
          <Bar dataKey="completedCount" fill="#4f46e5" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
