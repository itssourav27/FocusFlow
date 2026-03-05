export type DashboardStat = {
  label: string;
  value: number | string;
  helperText?: string;
};

export type TaskStatus = "pending" | "completed";

export type MeetingListItem = {
  id: string;
  title: string;
  date: Date;
  notes: string;
  createdAt: Date;
  taskCount: number;
};

export type TaskListItem = {
  id: string;
  meetingId: string;
  meetingTitle: string;
  title: string;
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
};

export type MeetingDetail = {
  id: string;
  title: string;
  date: Date;
  notes: string;
  createdAt: Date;
  tasks: TaskListItem[];
};

export type WeeklyCompletionDatum = {
  weekLabel: string;
  completedCount: number;
};

export type DashboardOverview = {
  totalMeetings: number;
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  completionRate: number;
  weeklyCompletedTasks: WeeklyCompletionDatum[];
};

export type TasksPerMeetingDatum = {
  meetingId: string;
  meetingTitle: string;
  taskCount: number;
};

export type AnalyticsOverview = {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number;
  tasksCompletedWeekly: WeeklyCompletionDatum[];
  tasksPerMeeting: TasksPerMeetingDatum[];
};
