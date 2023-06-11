import { createHandlersActionQB, type ActionEventHandlers } from "./handler/action";
import { type IBus } from "./bus";
import { type NotificationEventHandlers, createHandlersNotificationQB } from "./handler/notification";
import { type QB } from "../db.types";

export type Events = keyof Handlers;
export type Handlers = ActionEventHandlers & NotificationEventHandlers

export const createHandlers = (qb: QB) => {
    return (bus: IBus) => {
        return Object.assign(
            {},
            createHandlersActionQB(qb)(bus),
            createHandlersNotificationQB(qb)(bus),
        )
    }
}
