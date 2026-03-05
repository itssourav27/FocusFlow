import { endOfWeek, format, startOfWeek, subWeeks } from "date-fns";

import { prisma } from "@/lib/prisma";
import { AnalyticsOverview, WeeklyCompletionDatum } from "@/lib/types";

function getWeekRanges(numberOfWeeks: number) {
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

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const [totalTasks, completedTasks, tasksByMeetingRaw] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "completed" } }),
    prisma.meeting.findMany({
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    }),
  ]);

  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const weekRanges = getWeekRanges(8);
  const tasksCompletedWeekly: WeeklyCompletionDatum[] = await Promise.all(
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

  const tasksPerMeeting = tasksByMeetingRaw.map((meeting) => ({
    meetingId: meeting.id,
    meetingTitle: meeting.title,
    taskCount: meeting._count.tasks,
  }));

  return {
    totalTasks,
    completedTasks,
    pendingTasks: totalTasks - completedTasks,
    completionRate,
    tasksCompletedWeekly,
    tasksPerMeeting,
  };
}
