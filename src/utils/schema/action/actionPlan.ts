import { z } from "zod";
import { byIdSchema, organizationSchema } from "../general";

export const ACTION_PLAN_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    DELEYED: 'DELEYED',
} as const;

export const linePlanItemCreateSchema =z.object({
    productionLine: z.string(),
    assignedTo: z.string(),
    dueDate: z.date(),
    comment: z.string().optional().default(''),
})

export const linePlanItemEditSchema = z.object({
    id: z.string(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional(),
    comment: z.string().optional(),
})

export const linePlanFilterSchema = z.object({
    productionLine: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional().nullable(),
    status: z.array(z.enum([
        ACTION_PLAN_STATUS.IN_PROGRESS,
        ACTION_PLAN_STATUS.COMPLETED,
        ACTION_PLAN_STATUS.DELEYED,
    ])),
})