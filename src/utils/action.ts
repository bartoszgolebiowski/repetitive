import { z } from "zod";

export const ACTION_STATUS = {
    TO_DO: 'TO_DO',
    ASSIGNED: 'ASSIGNED',
    DELETED: 'DELETED',
    COMPLETED: 'COMPLETED',
} as const;

export const actionFilterSchema = z.object({
    organizationId: z.string().nonempty(),
    workplaceId: z.string().optional(),
    definitionId: z.string().optional(),
    createdBy: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.array(z.enum([
        ACTION_STATUS.TO_DO,
        ACTION_STATUS.ASSIGNED,
        ACTION_STATUS.DELETED,
        ACTION_STATUS.COMPLETED,
    ])).optional(),
})