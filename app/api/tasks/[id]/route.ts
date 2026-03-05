import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { isTaskStatus } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type Params = {
  params: {
    id: string;
  };
};

export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const body = (await request.json()) as {
      title?: string;
      deadline?: string;
      status?: string;
    };

    const payload: {
      title?: string;
      deadline?: Date;
      status?: string;
    } = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Task title cannot be empty" },
          { status: 400 },
        );
      }
      payload.title = title;
    }

    if (typeof body.deadline === "string") {
      const parsedDeadline = new Date(body.deadline);
      if (Number.isNaN(parsedDeadline.getTime())) {
        return NextResponse.json(
          { error: "Invalid deadline value" },
          { status: 400 },
        );
      }
      payload.deadline = parsedDeadline;
    }

    if (typeof body.status === "string") {
      if (!isTaskStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 },
        );
      }
      payload.status = body.status;
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data: payload,
      include: {
        meeting: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update task", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete task", detail: String(error) },
      { status: 500 },
    );
  }
}
