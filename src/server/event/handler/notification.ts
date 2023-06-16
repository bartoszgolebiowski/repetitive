import { NOTIFICATION_CAUSE } from '~/utils/schema/action/notification';
import { type QB } from '~/server/db';
import { type IBus } from "../bus";
import { log } from 'next-axiom'

export type NotificationEventHandlers = {
    "notification:actionCreated": (input: { id: string }) => Promise<null>;
    "notification:actionUpdated": (input: { id: string }) => Promise<null>;
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
    }),
    [NOTIFICATION_CAUSE['ACTION_CREATED']]: (id: string) => ({
        cause: NOTIFICATION_CAUSE['ACTION_CREATED'],
        variables: [id]
    }),
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
    actionCreated: (input: { id: string }) => Promise<null>;
    actionsDelayed: (input: { ids: string[] }) => Promise<null>;
}

class NotificationRepository implements INotificationRepository {
    constructor(private qb: QB) { }
    async createMany(input: { actions: { id: string, email: string }[], cause: keyof typeof NOTIFICATION_CAUSE }) {
        const { actions, cause } = input;
        try {
            await this.qb
                .insertInto('Notification')
                .values(actions.map(({ id, email }) => ({
                    email,
                    ...NOTIFICATION_MESSAGE[cause](id),
                })))
                .execute()
        } catch (err) {
            log.error('Error creating notifications', {
                err,
                input
            })
        }
        return null;
    }
}

class ActionRepository implements IActionRepository {
    constructor(private qb: QB) { }
    async getById(input: { id: string }) {
        const { id } = input;
        try {
            const action = await this.qb
                .selectFrom('Action')
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirstOrThrow()

            return action;
        } catch (err) {
            log.error('Error getting action by id', {
                err,
                input
            })
            return null;
        }
    }

    async geyByIds(input: { ids: string[] }) {
        const { ids } = input;
        try {
            const actions = await this.qb
                .selectFrom('Action')
                .select(['id', 'assignedTo', 'leader'])
                .where('id', 'in', ids)
                .execute()
            return actions
        } catch (err) {
            log.error('Error getting actions by ids', {
                err,
                input
            })
        }
        return [];
    }
}

class NotificationService implements INotificationService {
    constructor(
        private notificationRepository: INotificationRepository,
        private actionRepository: IActionRepository,
    ) { }
    async actionCreated(input: { id: string }) {
        const { id } = input;

        const action = await this.actionRepository.getById({ id })

        if (!action) {
            return null;
        }

        const idAndEmail = this.sameEmails(action) ?
            [createIdAndEmail(action.id, action.assignedTo)] :
            [createIdAndEmail(action.id, action.assignedTo), createIdAndEmail(action.id, action.leader)];

        await this.notificationRepository.createMany({
            actions: idAndEmail,
            cause: NOTIFICATION_CAUSE.ACTION_CREATED
        })

        return null
    }
    async actionUpdated(input: { id: string }) {
        const { id } = input;

        const action = await this.actionRepository.getById({ id })

        if (!action) {
            return null;
        }

        const idAndEmail = this.sameEmails(action) ?
            [createIdAndEmail(action.id, action.assignedTo)] :
            [createIdAndEmail(action.id, action.assignedTo), createIdAndEmail(action.id, action.leader)];

        await this.notificationRepository.createMany({
            actions: idAndEmail,
            cause: NOTIFICATION_CAUSE.ACTION_UPDATE
        })

        return null
    }
    async actionsDelayed(input: { ids: string[] }) {
        const { ids } = input;
        const actions = await this.actionRepository.geyByIds({ ids })
        if (!actions.length) {
            log.info('Actions not found', {
                input
            })
            return null;
        }
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
            "notification:actionUpdated": async (input) => {
                log.info('notification:actionUpdate:start', {
                    input
                })
                await notificationService.actionUpdated(input)
                log.info('notification:actionUpdate:end', {
                    input
                })
                return null
            },
            "notification:actionCreated": async (input) => {
                log.info('notification:actionCreate:start', {
                    input
                })
                await notificationService.actionCreated(input)
                log.info('notification:actionCreate:end', {
                    input
                })
                return null
            },
            "notification:actionsDelayed": async (input) => {
                log.info('notification:actionsDelayed:start', {
                    input
                })
                await notificationService.actionsDelayed(input)
                log.info('notification:actionUpdate:end', {
                    input
                })
                return null
            },
        }
    }
}
