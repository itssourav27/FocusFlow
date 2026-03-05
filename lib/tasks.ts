import { prisma } from "@/lib/prisma";
import { TaskStatus } from "@/lib/constants";
import { TaskListItem } from "@/lib/types";

export async function getTasks(status?: TaskStatus): Promise<TaskListItem[]> {
  const tasks = await prisma.task.findMany({
    where: status ? { status } : undefined,
    include: {
      meeting: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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
