import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/constants";
import { TaskListItem } from "@/lib/types";

export type TaskFilter = "all" | TaskStatus | "overdue";
export type TaskSort = "newest" | "oldest" | "deadline-asc" | "deadline-desc";

export type TaskFilterCounts = {
  all: number;
  pending: number;
  completed: number;
  overdue: number;
};

export async function getTasks(
  filter: TaskFilter = "all",
  sort: TaskSort = "newest",
  query?: string,
): Promise<TaskListItem[]> {
  const statusWhere =
    filter === "all"
      ? undefined
      : filter === "overdue"
        ? {
            status: "pending" as const,
            deadline: {
              lt: new Date(),
            },
          }
        : { status: filter };

  const trimmedQuery = query?.trim();

  const where = {
    ...(statusWhere ? statusWhere : {}),
    ...(trimmedQuery
      ? {
          OR: [
            {
              title: {
                contains: trimmedQuery,
              },
            },
            {
              meeting: {
                title: {
                  contains: trimmedQuery,
                },
              },
            },
          ],
        }
      : {}),
  };

  const orderBy =
    sort === "oldest"
      ? [{ createdAt: "asc" as const }]
      : sort === "deadline-asc"
        ? [{ deadline: "asc" as const }, { createdAt: "desc" as const }]
        : sort === "deadline-desc"
          ? [{ deadline: "desc" as const }, { createdAt: "desc" as const }]
          : [{ createdAt: "desc" as const }];

  const tasks = await prisma.task.findMany({
    where: Object.keys(where).length > 0 ? where : undefined,
    include: {
      meeting: {
        select: {
          title: true,
        },
      },
    },
    orderBy,
  });

  return tasks.map((task) => ({
    id: task.id,
    meetingId: task.meetingId,
    meetingTitle: task.meeting.title,
    title: task.title,
    deadline: task.deadline,
    status: task.status === "completed" ? "completed" : "pending",
    createdAt: task.createdAt,
  }));
}

export async function getTaskFilterCounts(): Promise<TaskFilterCounts> {
  const [all, pending, completed, overdue] = await Promise.all([
    prisma.task.count(),
    prisma.task.count({ where: { status: "pending" } }),
    prisma.task.count({ where: { status: "completed" } }),
    prisma.task.count({
      where: {
        status: "pending",
        deadline: {
          lt: new Date(),
        },
      },
    }),
  ]);

  return { all, pending, completed, overdue };
}
