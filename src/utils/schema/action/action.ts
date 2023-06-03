import { z } from "zod";
import { byIdSchema } from "../general";

export const ACTION_STATUS = {
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    DELAYED: 'DELAYED',
    REJECTED: 'REJECTED',
} as const;

export const ACTION_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
} as const;

export const actionItemSchema = z.object({
    actionPlanId: z.string(),
    name: z.string(),
    description: z.string(),
    startDate: z.date(),
    dueDate: z.date(),
    status: z.enum([
        ACTION_STATUS.IN_PROGRESS,
        ACTION_STATUS.COMPLETED,
        ACTION_STATUS.DELAYED,
        ACTION_STATUS.REJECTED
    ]),
    assignedTo: z.string(),
    leader: z.string(),
    priority: z.enum([
        ACTION_PRIORITY.LOW,
        ACTION_PRIORITY.MEDIUM,
        ACTION_PRIORITY.HIGH,
    ]),
    comment: z.string().optional().default(''),
})

export const actionEditItemSchema = byIdSchema.merge(z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    startDate: z.date().optional(),
    dueDate: z.date().optional(),
    status: z.enum([
        ACTION_STATUS.IN_PROGRESS,
        ACTION_STATUS.COMPLETED,
        ACTION_STATUS.DELAYED,
        ACTION_STATUS.REJECTED
    ]).optional(),
    assignedTo: z.string().optional(),
    leader: z.string().optional(),
    priority: z.enum([
        ACTION_PRIORITY.LOW,
        ACTION_PRIORITY.MEDIUM,
        ACTION_PRIORITY.HIGH,
    ]).optional(),
    comment: z.string().optional(),
}))

export const actionFilterSchema = z.object({
    filters: z.object({
        actionPlanId: z.string(),
        startDate: z.date().optional().nullable(),
        dueDate: z.date().optional().nullable(),
        assignedTo: z.string().optional(),
        leader: z.string().optional(),
        priority: z.array(z.enum([
            ACTION_PRIORITY.LOW,
            ACTION_PRIORITY.MEDIUM,
            ACTION_PRIORITY.HIGH,
        ])),
        status: z.array(z.enum([
            ACTION_STATUS.IN_PROGRESS,
            ACTION_STATUS.COMPLETED,
            ACTION_STATUS.DELAYED,
            ACTION_STATUS.REJECTED
        ])),
    }),
})