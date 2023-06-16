import { byIdSchema } from "../general"
import { z } from "zod"

export const NOTIFICATION_CAUSE = {
    "ACTION_UPDATE": "ACTION_UPDATE",
    "ACTION_CREATED": "ACTION_CREATED",
    "ACTION_MARKED_AS_EXPIRED": "ACTION_MARKED_AS_EXPIRED",
} as const

export const NOTIFICATION_CAUSE_MESSAGE = {
    "ACTION_UPDATE": `An action {0} you are following has been updated`,
    "ACTION_CREATED": `An action {0} has been created`,
    "ACTION_MARKED_AS_EXPIRED": `An action {0} you are following has been marked as expired`,
} as const

export const getMyNotificationSchema = z.object({
    page: z.number().default(0),
    pageSize: z.number().default(10),
})

export const markAsReadSchema = byIdSchema