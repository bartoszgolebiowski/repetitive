export const Status = {
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  DELAYED: "DELAYED",
  REJECTED: "REJECTED",
} as const;
export type Status = (typeof Status)[keyof typeof Status];
export const Priority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];
