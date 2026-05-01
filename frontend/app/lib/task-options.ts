import { TaskStatus } from "./types";

export const TASK_STATUSES: TaskStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "A faire",
  IN_PROGRESS: "En cours",
  COMPLETED: "Termine",
};

export const TASK_STATUS_BADGES: Record<TaskStatus, string> = {
  PENDING: "badge-warning",
  IN_PROGRESS: "badge-info",
  COMPLETED: "badge-success",
};
