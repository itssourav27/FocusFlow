export const TASK_CREATED_EVENT = "focusflow:task-created";
export const MEETING_CREATED_EVENT = "focusflow:meeting-created";
export const TASKS_CHANGED_EVENT = "focusflow:tasks-changed";

export type TaskCreatedEventPayload = {
  id: string;
  meetingId: string;
  title: string;
  deadline: string;
  status: "pending" | "completed";
  createdAt: string;
  meeting?: {
    title: string;
  };
};

export type MeetingCreatedEventPayload = {
  id: string;
  title: string;
  date: string;
  notes: string;
  createdAt: string;
};
