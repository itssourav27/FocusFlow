import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: Params) {
  const params = await context.params;

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: params.id },
      include: {
        tasks: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(meeting);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch meeting", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: Params) {
  const params = await context.params;

  try {
    const body = (await request.json()) as {
      title?: string;
      date?: string;
      notes?: string;
    };

    const payload: {
      title?: string;
      date?: Date;
      notes?: string;
    } = {};

    if (typeof body.title === "string") {
      const title = body.title.trim();
      if (!title) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 },
        );
      }
      payload.title = title;
    }

    if (typeof body.notes === "string") {
      payload.notes = body.notes.trim();
    }

    if (typeof body.date === "string") {
      const parsedDate = new Date(body.date);
      if (Number.isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date value" },
          { status: 400 },
        );
      }
      payload.date = parsedDate;
    }

    const meeting = await prisma.meeting.update({
      where: { id: params.id },
      data: payload,
    });

    return NextResponse.json(meeting);
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update meeting", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, context: Params) {
  const params = await context.params;

  try {
    await prisma.meeting.delete({ where: { id: params.id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete meeting", detail: String(error) },
      { status: 500 },
    );
  }
}
