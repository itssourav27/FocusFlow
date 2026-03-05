import Link from "next/link";

type MeetingCardProps = {
  id: string;
  title: string;
  date: string;
  taskCount: number;
  notesPreview?: string;
};

export default function MeetingCard({ id, title, date, taskCount, notesPreview }: MeetingCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{taskCount} tasks</span>
      </div>
      <p className="mt-2 text-sm text-slate-500">{date}</p>
      {notesPreview ? <p className="mt-3 text-sm text-slate-600">{notesPreview}</p> : null}
      <Link href={`/meetings/${id}`} className="mt-4 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-500">
        Open meeting
      </Link>
    </article>
  );
}
