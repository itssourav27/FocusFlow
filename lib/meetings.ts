import { prisma } from "@/lib/prisma";
import { MeetingDetail, MeetingListItem } from "@/lib/types";

export async function getMeetings(): Promise<MeetingListItem[]> {
  const meetings = await prisma.meeting.findMany({
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  return meetings.map((meeting) => ({
    id: meeting.id,
    title: meeting.title,
    date: meeting.date,
    notes: meeting.notes,
    createdAt: meeting.createdAt,
    taskCount: meeting._count.tasks,
  }));
}

export async function getMeetingById(id: string): Promise<MeetingDetail | null> {
  const meeting = await prisma.meeting.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!meeting) {
    return null;
  }

  return {
    id: meeting.id,
    title: meeting.title,
    date: meeting.date,
    notes: meeting.notes,
    createdAt: meeting.createdAt,
    tasks: meeting.tasks.map((task) => ({
      id: task.id,
      meetingId: task.meetingId,
      meetingTitle: meeting.title,
      title: task.title,
      deadline: task.deadline,
      status: task.status === "completed" ? "completed" : "pending",
      createdAt: task.createdAt,
    })),
  };
}
