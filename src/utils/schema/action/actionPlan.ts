import { z } from "zod";
import { byIdSchema, linePlanSchema } from "../general";

export const ACTION_PLAN_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    DELAYED: 'DELAYED',
    DELETED: 'DELETED',
    REJECTED: 'REJECTED',
} as const;

export const actionPlanCreateSchema = linePlanSchema.merge(z.object({
    name: z.string(),
    description: z.string(),
    dueDate: z.date(),
    assignedTo: z.string(),
}))

export const actionPlanEditSchema = byIdSchema.merge(z.object({
    name: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional(),
    description: z.string().optional(),
    status: z.enum([
        ACTION_PLAN_STATUS.IN_PROGRESS,
        ACTION_PLAN_STATUS.COMPLETED,
        ACTION_PLAN_STATUS.DELAYED,
    ]).optional(),
}))

export const actionPlanFilterSchema = linePlanSchema.merge(z.object({
    assignedTo: z.string().optional(),
    dueDate: z.date().optional().nullable(),
    status: z.array(z.enum([
        ACTION_PLAN_STATUS.IN_PROGRESS,
        ACTION_PLAN_STATUS.COMPLETED,
        ACTION_PLAN_STATUS.DELAYED,
        ACTION_PLAN_STATUS.REJECTED,
        ACTION_PLAN_STATUS.DELETED,
    ])),
}))