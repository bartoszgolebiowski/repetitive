import type { PrismaClient } from "@prisma/client"
import { createHandlersActionPrisma, type ActionEventHandlers } from "./handler/action";
import { type IBus } from "./bus";
import { type NotificationEventHandlers, createHandlersNotificationPrisma } from "./handler/notification";

export type Events = keyof Handlers;
export type Handlers = ActionEventHandlers & NotificationEventHandlers

export const createHandlers = (prisma: PrismaClient) => {
    return (bus: IBus) => {
        return Object.assign(
            {},
            createHandlersActionPrisma(prisma)(bus),
            createHandlersNotificationPrisma(prisma)(bus),
        )
    }
}
