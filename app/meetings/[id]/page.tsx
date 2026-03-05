import { format } from "date-fns";
import { notFound } from "next/navigation";

import DeleteMeetingButton from "@/components/meetings/DeleteMeetingButton";
import MeetingForm from "@/components/meetings/MeetingForm";
import TaskForm from "@/components/tasks/TaskForm";
import TaskList from "@/components/tasks/TaskList";
import { getMeetingById } from "@/lib/meetings";

type MeetingDetailPageProps = {
  params: {
    id: string;
  };
};

export const dynamic = "force-dynamic";

export default async function MeetingDetailPage({ params }: MeetingDetailPageProps) {
  const meeting = await getMeetingById(params.id);

  if (!meeting) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{meeting.title}</h1>
          <DeleteMeetingButton meetingId={meeting.id} />
        </div>
        <p className="mt-2 text-sm text-slate-500">Meeting date: {format(meeting.date, "PPP")}</p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <MeetingForm
          heading="Update Meeting"
          endpoint={`/api/meetings/${meeting.id}`}
          method="PATCH"
          buttonLabel="Update Meeting"
          initialTitle={meeting.title}
          initialDate={format(meeting.date, "yyyy-MM-dd")}
          initialNotes={meeting.notes}
        />

        <TaskForm meetings={[{ id: meeting.id, title: meeting.title }]} defaultMeetingId={meeting.id} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-slate-900">Action Items</h2>
        <TaskList tasks={meeting.tasks} meetingScopeId={meeting.id} />
      </section>
    </main>
  );
}
