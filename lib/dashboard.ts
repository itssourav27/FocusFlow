import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";

import { prisma } from "@/lib/prisma";
import { DashboardOverview, WeeklyCompletionDatum } from "@/lib/types";

function getRecentWeekRanges(numberOfWeeks: number) {
  const today = new Date();

  return Array.from({ length: numberOfWeeks }, (_, index) => {
    const shiftedDate = subWeeks(today, numberOfWeeks - 1 - index);
    const start = startOfWeek(shiftedDate, { weekStartsOn: 1 });
    const end = endOfWeek(shiftedDate, { weekStartsOn: 1 });

    return {
      start,
      end,
      label: format(start, "MMM d"),
    };
  });
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const [totalMeetings, totalTasks, pendingTasks, completedTasks] = await Promise.all([
    prisma.meeting.count(),
    prisma.task.count(),
    prisma.task.count({ where: { status: "pending" } }),
    prisma.task.count({ where: { status: "completed" } }),
  ]);

  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const weekRanges = getRecentWeekRanges(6);

  const weeklyCompletedTasks: WeeklyCompletionDatum[] = await Promise.all(
    weekRanges.map(async ({ start, end, label }) => {
      const completedCount = await prisma.task.count({
        where: {
          status: "completed",
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      });

      return {
        weekLabel: label,
        completedCount,
      };
    }),
  );

  return {
    totalMeetings,
    totalTasks,
    pendingTasks,
    completedTasks,
    completionRate,
    weeklyCompletedTasks,
  };
}
