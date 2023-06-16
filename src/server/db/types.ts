import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

import type { Status, Priority } from "./enums";

export type Action = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  name: string;
  description: string;
  startDate: Timestamp;
  dueDate: Timestamp;
  assignedTo: string;
  priority: Priority;
  status: Status;
  leader: string;
  actionPlanId: string;
};
export type ActionPlan = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  status: Status;
  name: string;
  description: string;
  assignedTo: string;
  dueDate: Timestamp;
  linePlanId: string;
};
export type Comment = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  createdBy: string;
  comment: string;
  actionId: string;
};
export type LinePlan = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  createdBy: string;
  updatedAt: Timestamp;
  updatedBy: string;
  organizationId: string;
  productionLine: string;
  assignedTo: string;
  dueDate: Timestamp;
  status: Status;
};
export type Notification = {
  id: Generated<string>;
  createdAt: Generated<Timestamp>;
  cause: string;
  read: Generated<boolean>;
  email: string;
  variables: string[];
};
export type DB = {
  Action: Action;
  ActionPlan: ActionPlan;
  Comment: Comment;
  LinePlan: LinePlan;
  Notification: Notification;
};
