const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Reset data to keep seed output deterministic for demos.
  await prisma.task.deleteMany();
  await prisma.meeting.deleteMany();

  const today = new Date();

  const meetings = [
    {
      title: "Sprint Planning",
      dateOffsetDays: -2,
      notes:
        "Reviewed backlog priorities and aligned on sprint scope. Focus on checkout reliability and analytics instrumentation.",
      tasks: [
        {
          title: "Break down checkout bug tickets",
          deadlineOffsetDays: 1,
          status: "completed",
        },
        {
          title: "Define sprint acceptance criteria",
          deadlineOffsetDays: 2,
          status: "completed",
        },
        {
          title: "Prepare dependency risk list",
          deadlineOffsetDays: 3,
          status: "pending",
        },
      ],
    },
    {
      title: "Client Weekly Sync",
      dateOffsetDays: -1,
      notes:
        "Shared progress on dashboard revamp and confirmed go-live timeline. Need final sign-off on metrics definitions.",
      tasks: [
        {
          title: "Send revised KPI glossary",
          deadlineOffsetDays: 1,
          status: "pending",
        },
        {
          title: "Capture stakeholder approvals",
          deadlineOffsetDays: 4,
          status: "pending",
        },
        {
          title: "Publish sync recap in workspace",
          deadlineOffsetDays: 0,
          status: "completed",
        },
      ],
    },
    {
      title: "Engineering Retrospective",
      dateOffsetDays: 0,
      notes:
        "Team identified flaky test hotspots and CI bottlenecks. Agreed to add ownership rotations for incident triage.",
      tasks: [
        {
          title: "Create flaky test audit board",
          deadlineOffsetDays: 5,
          status: "pending",
        },
        {
          title: "Document CI retry policy",
          deadlineOffsetDays: 2,
          status: "completed",
        },
        {
          title: "Set up on-call handoff checklist",
          deadlineOffsetDays: 6,
          status: "pending",
        },
      ],
    },
  ];

  for (const meetingSeed of meetings) {
    const meetingDate = new Date(today);
    meetingDate.setDate(today.getDate() + meetingSeed.dateOffsetDays);

    await prisma.meeting.create({
      data: {
        title: meetingSeed.title,
        date: meetingDate,
        notes: meetingSeed.notes,
        tasks: {
          create: meetingSeed.tasks.map((task) => {
            const deadline = new Date(today);
            deadline.setDate(today.getDate() + task.deadlineOffsetDays);

            return {
              title: task.title,
              deadline,
              status: task.status,
            };
          }),
        },
      },
    });
  }

  const meetingCount = await prisma.meeting.count();
  const taskCount = await prisma.task.count();

  console.log(
    `Seed completed: ${meetingCount} meetings and ${taskCount} tasks created.`,
  );
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
