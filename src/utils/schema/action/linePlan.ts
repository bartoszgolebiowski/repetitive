import { z } from "zod";
import { byIdSchema, organizationSchema } from "../general";
import { stringCSVRequired, dateCSVRequired, validUserCSVRequired } from "~/components/action/import/utils";

export const LINE_PLAN_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    DELAYED: 'DELAYED',
    REJECTED: 'REJECTED',
} as const;

export const linePlanItemCreateSchema = organizationSchema.merge(z.object({
    productionLine: z.string(),
    assignedTo: z.string(),
    dueDate: z.date(),
    comment: z.string().optional().default(''),
}))

export const linePlanItemEditSchema = byIdSchema.merge(z.object({
    productionLine: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional(),
    comment: z.string().optional(),
}))

export const linePlanFilterSchema = organizationSchema.merge(z.object({
    productionLine: z.string().optional(),
    assignedTo: z.string().optional(),
    dueDate: z.date().optional().nullable(),
    status: z.array(z.enum([
        LINE_PLAN_STATUS.IN_PROGRESS,
        LINE_PLAN_STATUS.COMPLETED,
        LINE_PLAN_STATUS.DELAYED,
        LINE_PLAN_STATUS.REJECTED,
    ])),
}))

export const linePlanCSVItemSchemaFactory = (users: string[]) => z.object({
    productionLine: stringCSVRequired(),
    assignedTo: validUserCSVRequired(users),
    dueDate: dateCSVRequired(),
})

export const linePlanImportSchema = z.array(
    z.object({
        organizationId: z.string(),
        productionLine: z.string(),
        assignedTo: z.string(),
        dueDate: z.date(),
    })
)