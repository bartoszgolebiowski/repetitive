import { byIdSchema } from "../general"
import { z } from "zod"

export const NOTIFICATION_CAUSE = {
    "ACTION_UPDATE": "ACTION_UPDATE",
    "ACTION_MARKED_AS_EXPIRED": "ACTION_MARKED_AS_EXPIRED",
} as const

export const getMyNotificationSchema = z.object({
    page: z.number().default(0),
    pageSize: z.number().default(10),
})

export const createNotificationSchema = z.object({
    title: z.string(),
    message: z.string(),
    email: z.string().email(),
    cause: z.enum([
        NOTIFICATION_CAUSE.ACTION_UPDATE,
    ]),
})

export const markAsReadSchema = byIdSchema