import { NOTIFICATION_CAUSE } from '~/utils/schema/action/notification';
import { type IBus } from "../bus";
import { type QB } from '~/server/db';

export type NotificationEventHandlers = {
    "notification:actionUpdate": (input: { id: string }) => Promise<null>;
    "notification:actionsDelayed": (input: { ids: string[] }) => Promise<null>;
}

const NOTIFICATION_MESSAGE = {
    [NOTIFICATION_CAUSE['ACTION_UPDATE']]: (id: string) => ({
        cause: NOTIFICATION_CAUSE['ACTION_UPDATE'],
        variables: [id]
    }),
    [NOTIFICATION_CAUSE['ACTION_MARKED_AS_EXPIRED']]: (id: string) => ({
        cause: NOTIFICATION_CAUSE['ACTION_MARKED_AS_EXPIRED'],
        variables: [id]
    })
} as const;

interface INotificationRepository {
    createMany: (input: { actions: { id: string, email: string }[], cause: keyof typeof NOTIFICATION_CAUSE }) => Promise<null>;
}

interface IActionRepository {
    getById: (input: { id: string }) => Promise<{ id: string, leader: string, assignedTo: string } | null>;
    geyByIds: (input: { ids: string[] }) => Promise<{ id: string, leader: string, assignedTo: string }[]>;
}

interface INotificationService {
    actionUpdated: (input: { id: string }) => Promise<null>;
    actionsDelayed: (input: { ids: string[] }) => Promise<null>;
}

class NotificationRepository implements INotificationRepository {
    constructor(private qb: QB) { }
    async createMany(input: { actions: { id: string, email: string }[], cause: keyof typeof NOTIFICATION_CAUSE }) {
        const { actions, cause } = input;

        await this.qb
            .insertInto('Notification')
            .values(actions.map(({ id, email }) => ({
                email,
                ...NOTIFICATION_MESSAGE[cause](id),
            })))
            .execute()

        return null;

    }
}

class ActionRepository implements IActionRepository {
    constructor(private qb: QB) { }
    async getById(input: { id: string }) {
        const { id } = input;
        const action = await this.qb
            .selectFrom('Action')
            .select(['id', 'assignedTo', 'leader'])
            .where('id', '=', id)
            .executeTakeFirst()

        return action ?? null
    }

    async geyByIds(input: { ids: string[] }) {
        const { ids } = input;

        const actions = await this.qb
            .selectFrom('Action')
            .select(['id', 'assignedTo', 'leader'])
            .where('id', 'in', ids)
            .execute()

        return actions;
    }
}

class NotificationService implements INotificationService {
    constructor(
        private notificationRepository: INotificationRepository,
        private actionRepository: IActionRepository,
    ) { }
    async actionUpdated(input: { id: string }) {
        const { id } = input;
        const action = await this.actionRepository.getById({ id })
        if (!action) {
            return null;
        }

        if (this.sameEmails(action)) {
            await this.notificationRepository.createMany({
                actions: [createIdAndEmail(action.id, action.assignedTo)],
                cause: NOTIFICATION_CAUSE.ACTION_UPDATE
            })
        } else {
            await this.notificationRepository.createMany({
                actions: [
                    createIdAndEmail(action.id, action.assignedTo),
                    createIdAndEmail(action.id, action.leader),
                ],
                cause: NOTIFICATION_CAUSE.ACTION_UPDATE
            })
        }
        return null
    }
    async actionsDelayed(input: { ids: string[] }) {
        const { ids } = input;
        const actions = await this.actionRepository.geyByIds({ ids })
        const actionsUniqueEmails = this.removeDuplicatedNotifications(actions)

        await this.notificationRepository.createMany({
            actions: actionsUniqueEmails,
            cause: NOTIFICATION_CAUSE.ACTION_MARKED_AS_EXPIRED
        })
        return null
    }

    private removeDuplicatedNotifications(actions: { id: string; leader: string; assignedTo: string; }[]) {
        return actions.reduce((acc, action) => {
            if (this.sameEmails(action)) {
                return [...acc, createIdAndEmail(action.id, action.assignedTo)];
            }
            return [...acc, createIdAndEmail(action.id, action.assignedTo), createIdAndEmail(action.id, action.leader)];
        }, [] as { id: string; email: string; }[]);
    }

    private sameEmails(action: { leader: string; assignedTo: string; }) {
        const assignedTo = action.assignedTo.trim();
        const leader = action.leader.trim();
        return assignedTo === leader
    }
}

const createIdAndEmail = (id: string, email: string) => ({ id, email })

export const createHandlersNotificationQB = (
    qb: QB
): (bus: IBus) => NotificationEventHandlers => {
    const notificationRepository = new NotificationRepository(qb)
    const actionRepository = new ActionRepository(qb)

    return createHandlersNotification(
        notificationRepository,
        actionRepository,
    )
}

export const createHandlersNotification = (
    notificationRepository: INotificationRepository,
    actionRepository: IActionRepository,
): (bus: IBus) => NotificationEventHandlers => {
    const notificationService = new NotificationService(notificationRepository, actionRepository);
    return () => {
        return {
            "notification:actionUpdate": async (input) => {
                await notificationService.actionUpdated(input)
                return null
            },
            "notification:actionsDelayed": async (input) => {
                await notificationService.actionsDelayed(input)
                return null
            },
        }
    }
}
