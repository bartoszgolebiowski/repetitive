import type { PrismaClient } from "@prisma/client"
import { createHandlersActionPrisma, type ActionEventHandlers } from "./handler/action";
import { type IBus } from "./bus";

export type Events = keyof Handlers;
export type Handlers = ActionEventHandlers;

export const createHandlers = (prisma: PrismaClient) => {
    return (bus: IBus) => {
        return Object.assign(
            {},
            createHandlersActionPrisma(prisma)(bus),
        )
    }
}
