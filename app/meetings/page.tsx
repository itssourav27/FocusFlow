import { format } from "date-fns";

import MeetingList from "@/components/meetings/MeetingList";
import MeetingForm from "@/components/meetings/MeetingForm";
import { getMeetings } from "@/lib/meetings";

export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const meetings = await getMeetings();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Meetings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Capture meeting notes and track related action items.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <MeetingForm />

        <MeetingList
          initialMeetings={meetings.map((meeting) => ({
            id: meeting.id,
            title: meeting.title,
            date: format(meeting.date, "yyyy-MM-dd"),
            notes: meeting.notes,
            taskCount: meeting.taskCount,
          }))}
        />
      </section>
    </main>
  );
}
