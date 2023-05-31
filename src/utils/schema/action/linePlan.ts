import { z } from "zod";
import { byIdSchema, organizationSchema } from "../general";

export const LINE_PLAN_STATUS = {
    OK: 'OK',
    NOK: 'NOK',
} as const;

export const linePlanItemCreateSchema = organizationSchema.merge(z.object({
    productionLine: z.string(),
    assignedTo: z.string(),
    dueDate: z.date(),
    comment: z.string().optional().default(''),
}))

export const linePlanItemEditSchema = byIdSchema.merge(z.object({
    id: z.string(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional(),
    comment: z.string().optional(),
}))

export const linePlanFilterSchema = organizationSchema.merge(z.object({
    productionLine: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional().nullable(),
    status: z.array(z.enum([
        LINE_PLAN_STATUS.OK,
        LINE_PLAN_STATUS.NOK,
    ])),
}))