import { z } from "zod";
import { defectCreateSchema } from "./defect";
import { plantSchema } from "./general";

export const CHECKLIST_STATUS = {
    DONE: "DONE",
    MISSING: "MISSING",
    ACTION_REQUIRED: "ACTION_REQUIRED",
} as const

export const CHECKLIST_CREATOR = 'SYSTEM' as const

export const generateMockSchema = plantSchema.merge(z.object({
    startDate: z.date().optional(),
    endDate: z.date().optional()
}))
export const submitSchema = plantSchema.merge(z.object({
    done: z.array(z.string()),
    defect: z.array(defectCreateSchema)
}))
export const generateSchema = plantSchema.merge(z.object({ startDate: z.date(), endDate: z.date() }))
export const getSchema = plantSchema.merge(z.object({
    startDay: z.date(),
    endDay: z.date(),
    timezoneOffsetStart: z.number(),
    timezoneOffsetEnd: z.number()
}))

export const getHistorySchema = plantSchema.merge(z.object({
    startDay: z.date(),
    endDay: z.date(),
    timezoneOffsetStart: z.number(),
    timezoneOffsetEnd: z.number()
}))
