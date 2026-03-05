import { NextRequest, NextResponse } from "next/server";

import { isTaskStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get("status");

    const tasks = await prisma.task.findMany({
      where:
        statusParam && isTaskStatus(statusParam)
          ? { status: statusParam }
          : undefined,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
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
