export const TASK_STATUS_VALUES = ["pending", "completed"] as const;

export type TaskStatus = (typeof TASK_STATUS_VALUES)[number];

export function isTaskStatus(value: unknown): value is TaskStatus {
  return (
    typeof value === "string" &&
    TASK_STATUS_VALUES.includes(value as TaskStatus)
  );
}
