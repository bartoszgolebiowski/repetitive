import { z } from "zod";

export const DEFECT_STATUS = {
    TO_DO: 'TO_DO',
    ASSIGNED: 'ASSIGNED',
    DELETED: 'DELETED',
    COMPLETED: 'COMPLETED',
} as const;

export const defectItemSchema = z.object({
    definitionTaskId: z.string(),
    dueDate: z.date(),
    description: z.string(),
    assignedTo: z.string(),
    status: z.enum([
        DEFECT_STATUS.TO_DO,
        DEFECT_STATUS.ASSIGNED,
        DEFECT_STATUS.DELETED,
        DEFECT_STATUS.COMPLETED,
    ]),
})

export const defectsFilterSchema = z.object({
    definitionId: z.string().optional(),
    createdBy: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.array(z.enum([
        DEFECT_STATUS.TO_DO,
        DEFECT_STATUS.ASSIGNED,
        DEFECT_STATUS.DELETED,
        DEFECT_STATUS.COMPLETED,
    ])).optional(),
    organizationId: z.string().nonempty(),
    plantId: z.string().optional(),
})