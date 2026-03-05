import { NextRequest, NextResponse } from "next/server";

import { addDays, endOfDay, startOfToday } from "date-fns";

import { isTaskStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get("status");
    const sortParam = request.nextUrl.searchParams.get("sort");
    const queryParam = request.nextUrl.searchParams.get("q")?.trim();

    const statusWhere =
      statusParam === "overdue"
        ? {
            status: "pending" as const,
            deadline: {
              lt: new Date(),
            },
          }
        : statusParam === "due-soon"
          ? {
              status: "pending" as const,
              deadline: {
                gte: startOfToday(),
                lte: endOfDay(addDays(startOfToday(), 3)),
              },
            }
        : statusParam && isTaskStatus(statusParam)
          ? { status: statusParam }
          : undefined;

    const where = {
      ...(statusWhere ? statusWhere : {}),
      ...(queryParam
        ? {
            OR: [
              {
                title: {
                  contains: queryParam,
                },
              },
              {
                meeting: {
                  title: {
                    contains: queryParam,
                  },
                },
              },
            ],
          }
        : {}),
    };

    const orderBy =
      sortParam === "oldest"
        ? [{ createdAt: "asc" as const }]
        : sortParam === "deadline-asc"
          ? [{ deadline: "asc" as const }, { createdAt: "desc" as const }]
          : sortParam === "deadline-desc"
            ? [{ deadline: "desc" as const }, { createdAt: "desc" as const }]
            : [{ createdAt: "desc" as const }];

    const tasks = await prisma.task.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy,
    });

    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tasks", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      meetingId?: string;
      title?: string;
      deadline?: string;
      status?: string;
    };

    const meetingId = body.meetingId?.trim();
    const title = body.title?.trim();
    const status = body.status ?? "pending";
    const deadlineDate = body.deadline ? new Date(body.deadline) : null;

    if (!meetingId) {
      return NextResponse.json(
        { error: "Meeting ID is required" },
        { status: 400 },
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 },
      );
    }

    if (!deadlineDate || Number.isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: "A valid deadline is required" },
        { status: 400 },
      );
    }

    if (!isTaskStatus(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 },
      );
    }

    const task = await prisma.task.create({
      data: {
        meetingId,
        title,
        deadline: deadlineDate,
        status,
      },
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create task", detail: String(error) },
      { status: 500 },
    );
  }
}
