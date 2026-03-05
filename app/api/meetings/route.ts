import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
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

    return NextResponse.json(meetings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch meetings", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      title?: string;
      date?: string;
      notes?: string;
    };

    const title = body.title?.trim();
    const notes = body.notes?.trim() ?? "";
    const dateValue = body.date ? new Date(body.date) : null;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!dateValue || Number.isNaN(dateValue.getTime())) {
      return NextResponse.json(
        { error: "A valid date is required" },
        { status: 400 },
      );
    }

    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: dateValue,
        notes,
      },
    });

    return NextResponse.json(meeting, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create meeting", detail: String(error) },
      { status: 500 },
    );
  }
}
