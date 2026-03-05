"use client";

import { format } from "date-fns";
import { useEffect, useState } from "react";

import MeetingCard from "@/components/meetings/MeetingCard";
import {
  MEETING_CREATED_EVENT,
  MeetingCreatedEventPayload,
} from "@/lib/client-events";

type MeetingListItemView = {
  id: string;
  title: string;
  date: string;
  notes: string;
  taskCount: number;
};

type MeetingListProps = {
  initialMeetings: MeetingListItemView[];
};

export default function MeetingList({ initialMeetings }: MeetingListProps) {
  const [meetings, setMeetings] = useState(initialMeetings);

  useEffect(() => {
    function handleMeetingCreated(event: Event) {
      const customEvent = event as CustomEvent<MeetingCreatedEventPayload>;
      const payload = customEvent.detail;

      const nextMeeting: MeetingListItemView = {
        id: payload.id,
        title: payload.title,
        date: payload.date,
        notes: payload.notes,
        taskCount: 0,
      };

      setMeetings((current) => [
        nextMeeting,
        ...current.filter((meeting) => meeting.id !== payload.id),
      ]);
    }

    window.addEventListener(MEETING_CREATED_EVENT, handleMeetingCreated);

    return () => {
      window.removeEventListener(MEETING_CREATED_EVENT, handleMeetingCreated);
    };
  }, []);

  if (meetings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        No meetings yet. Create your first one.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          id={meeting.id}
          title={meeting.title}
          date={format(new Date(meeting.date), "PPP")}
          taskCount={meeting.taskCount}
          notesPreview={meeting.notes.slice(0, 140)}
        />
      ))}
    </div>
  );
}
