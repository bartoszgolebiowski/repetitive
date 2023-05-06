import { z } from "zod";
import { definitionTaskSchema, organizationAndPlantSchema, plantSchema } from "./general";

export const DEFECT_STATUS = {
    TO_DO: 'TO_DO',
    ASSIGNED: 'ASSIGNED',
    DELETED: 'DELETED',
    COMPLETED: 'COMPLETED',
} as const;

export const defectCreateSchema = definitionTaskSchema.merge(z.object({
    dueDate: z.date(),
    description: z.string(),
    assignedTo: z.string(),
    status: z.enum([
        DEFECT_STATUS.TO_DO,
        DEFECT_STATUS.ASSIGNED,
        DEFECT_STATUS.DELETED,
        DEFECT_STATUS.COMPLETED,
    ]),
}))

export const getDefectsSchema = organizationAndPlantSchema.merge(z.object({
    definitionId: z.string().optional(),
    createdBy: z.string().optional(),
    assignedTo: z.string().optional(),
    status: z.array(z.enum([
        DEFECT_STATUS.TO_DO,
        DEFECT_STATUS.ASSIGNED,
        DEFECT_STATUS.DELETED,
        DEFECT_STATUS.COMPLETED,
    ])).optional(),
}))

export const defectCreateManySchema = plantSchema.merge(z.object({
    actions:
        z.array(definitionTaskSchema.merge(z.object({
            description: z.string(),
            status: z.enum([
                DEFECT_STATUS.TO_DO,
                DEFECT_STATUS.ASSIGNED,
                DEFECT_STATUS.DELETED,
                DEFECT_STATUS.COMPLETED,
            ]),
            dueDate: z.date(),
            assignedTo: z.string(),
        })))
}))