import type { PrismaClient } from "@prisma/client"
import { createHandlersActionPrisma, type ActionEventHandlers } from "./action";

export type Events = keyof Handlers;
export type Handlers = ActionEventHandlers;

export const createHandlers = (prisma: PrismaClient): Handlers => {
    return {
        ...createHandlersActionPrisma(prisma),
    }
}
