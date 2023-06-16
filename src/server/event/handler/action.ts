import { ACTION_PLAN_STATUS } from '~/utils/schema/action/actionPlan'
import { ACTION_STATUS } from "~/utils/schema/action/action";
import { LINE_PLAN_STATUS } from "~/utils/schema/action/linePlan";
import { type QB } from '~/server/db';
import { type IBus } from "../bus";
import { log } from "next-axiom"

export type ActionEventHandlers = {
    "action:imported": (input: { expiryDate: Date, ids: string[] }) => Promise<null>;
    "action:created": (input: { id: string, actionPlanId: string }) => Promise<null>;
    "action:updated": (input: { id: string, actionPlanId: string }) => Promise<null>;
    "action:syncStatuses": (input: { expiryDate: Date }) => Promise<null>;
    "actionPlan:syncStatuses": (input: { actionPlanId: string }) => Promise<null>;
}

interface IActionRepository {
    updateManyStatus: (input: { ids: string[], status: keyof typeof ACTION_STATUS }) => Promise<{ count: number }>;
    getAllExpiredActions: (input: { expiryDate: Date }) => Promise<{ id: string, actionPlanId: string }[]>;
    getAllExpiredActionsFromSelectedIds: (input: { expiryDate: Date, ids: string[] }) => Promise<{ id: string, actionPlanId: string }[]>;
    getAllByActionPlanId: (input: { actionPlanId: string }) => Promise<{ status: string }[]>;
}
interface IActionPlanRepository {
    getAllByLinePlanId: (input: { linePlanId: string }) => Promise<{ status: string }[]>;
    updateStatus: (input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) => Promise<{
        id: string;
        linePlanId: string
    }>;
}
interface ILinePlanRepository {
    updateStatus: (input: { linePlanId: string, status: keyof typeof LINE_PLAN_STATUS }) => Promise<null>;
}
interface IActionService {
    findAllExpiredActionsAndUpdateStatusToDelayed: (input: { expiryDate: Date }) => Promise<string[]>;
    findExpiredActionsFromSelectedIdsAndUpdateStatusToDelayed: (input: { ids: string[], expiryDate: Date }) => Promise<string[]>;
}
interface IActionPlanService {
    updateStatusToCompleted: (input: { actionPlanId: string }) => Promise<{
        id: string;
        linePlanId: string
    }>;
    updateStatusToDelayed: (input: { actionPlanId: string }) => Promise<{
        id: string;
        linePlanId: string
    }>;
    updateStatusToInProgress: (input: { actionPlanId: string }) => Promise<{
        id: string;
        linePlanId: string
    }>;
}
interface ILinePlanService {
    updateStatusToCompleted: (input: { linePlanId: string }) => Promise<null>;
    updateStatusToDelayed: (input: { linePlanId: string }) => Promise<null>;
    updateStatusToInProgress: (input: { linePlanId: string }) => Promise<null>;
    syncStatusLinePlan: (input: { linePlanId: string }) => Promise<null>;
}

class ActionRepository implements IActionRepository {
    constructor(private qb: QB) { }
    async getAllExpiredActions(input: { expiryDate: Date }) {
        try {
            const actions = await this.qb
                .selectFrom('Action')
                .select(['id', 'actionPlanId'])
                .where('status', '=', ACTION_STATUS.IN_PROGRESS)
                .where('dueDate', '<', input.expiryDate)
                .execute()

            return actions
        } catch (error) {
            log.error('Error getting expired actions', {
                error,
                input
            })
        }
        return []
    }
    async getAllExpiredActionsFromSelectedIds(input: { expiryDate: Date, ids: string[] }) {
        try {
            const actions = await this.qb
                .selectFrom('Action')
                .select(['id', 'actionPlanId'])
                .where('status', '=', ACTION_STATUS.IN_PROGRESS)
                .where('dueDate', '<', input.expiryDate)
                .where('id', 'in', input.ids)
                .execute()

            return actions
        }
        catch (error) {
            log.error('Error getting expired actions from selected ids', {
                error,
                input
            })
        }
        return []
    }
    async getAllByActionPlanId(input: { actionPlanId: string }) {
        try {
            const actions = await this.qb
                .selectFrom('Action')
                .select(['status'])
                .where('actionPlanId', '=', input.actionPlanId)
                .execute()

            return actions
        } catch (error) {
            log.error('Error getting actions by action plan id', {
                error,
                input
            })
        }
        return [];
    }
    async updateManyStatus(input: { ids: string[], status: keyof typeof ACTION_STATUS }) {
        try {
            const action = await this.qb
                .updateTable('Action')
                .set({
                    status: input.status,
                })
                .where('id', 'in', input.ids)
                .execute()

            return {
                count: action.length
            }
        } catch (error) {
            log.error('Error updating many actions', {
                error,
                input
            })
        }
        return {
            count: 0
        }
    }
}
class ActionPlanRepository implements IActionPlanRepository {
    constructor(private qb: QB) { }
    async getAllByLinePlanId(input: { linePlanId: string }) {
        try {
            const actions = await this.qb
                .selectFrom('ActionPlan')
                .select('status')
                .where('linePlanId', '=', input.linePlanId)
                .execute()

            return actions;
        } catch (error) {
            log.error('Error getting actions by line plan id', {
                error,
                input
            })
        }
        return [];
    }
    async updateStatus(input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) {
        try {
            const actionPlan = await this.qb
                .updateTable('ActionPlan')
                .set({
                    status: input.status,
                })
                .where('id', '=', input.actionPlanId)
                .returning(['id', 'linePlanId'])
                .executeTakeFirstOrThrow()

            return {
                id: input.actionPlanId,
                linePlanId: actionPlan.linePlanId,
            }
        } catch (error) {
            log.error('Error updating action plan status', {
                error,
                input
            })
        }
        throw new Error('Error updating action plan status')
    }
}
class LinePlanRepository implements ILinePlanRepository {
    constructor(private qb: QB) { }
    async updateStatus(input: { linePlanId: string, status: keyof typeof LINE_PLAN_STATUS }) {
        try {
            await this.qb
                .updateTable('LinePlan')
                .set({
                    status: input.status,
                })
                .where('id', '=', input.linePlanId)
                .execute()
        } catch (error) {
            log.error('Error updating line plan status', {
                error,
                input
            })
        }
        return null;
    }
}
class ActionService implements IActionService {
    constructor(private actionRepository: IActionRepository, private bus: IBus) { }
    async findAllExpiredActionsAndUpdateStatusToDelayed(input: { expiryDate: Date }) {
        const expiredActions = await this.actionRepository.getAllExpiredActions(input);
        if (!expiredActions.length) return []
        await this.updateManyStatusesToDelayed({ ids: expiredActions.map(action => action.id) })
        this.bus.emit('notification:actionsDelayed', { ids: expiredActions.map(({ id }) => id) })
        return [...new Set(expiredActions.map(action => action.actionPlanId))]
    }
    async findExpiredActionsFromSelectedIdsAndUpdateStatusToDelayed(input: { ids: string[], expiryDate: Date }) {
        const expiredActions = await this.actionRepository.getAllExpiredActionsFromSelectedIds(input);
        if (!expiredActions.length) return []
        await this.updateManyStatusesToDelayed({ ids: expiredActions.map(action => action.id) })
        this.bus.emit('notification:actionsDelayed', { ids: expiredActions.map(({ id }) => id) })
        return [...new Set(expiredActions.map(action => action.actionPlanId))]
    }
    async updateManyStatusesToDelayed(input: { ids: string[] }) {
        return this.actionRepository.updateManyStatus({
            ids: input.ids,
            status: ACTION_STATUS.DELAYED,
        })
    }
}
class ActionPlanService implements IActionPlanService {
    constructor(
        private actionPlanRepository: IActionPlanRepository,
        private actionRepository: IActionRepository,
    ) { }
    async syncStatusActionPlan(input: { actionPlanId: string }) {
        const actions = await this.actionRepository.getAllByActionPlanId(input)
        const atLeastOneAction = actions.length > 0

        const isAtLeastOneActionDelay = actions
            .some(isDelayed) && atLeastOneAction
        const isAllActionsCompletedOrRejected = actions
            .every(isCompletedOrRejected) && atLeastOneAction

        let actionPlan: { linePlanId: string };
        if (isAtLeastOneActionDelay) {
            actionPlan = await this.updateStatusToDelayed(input)
        }
        else if (isAllActionsCompletedOrRejected) {
            actionPlan = await this.updateStatusToCompleted(input)
        }
        else {
            actionPlan = await this.updateStatusToInProgress(input)
        }

        return { linePlanId: actionPlan.linePlanId };
    }
    async updateStatusToCompleted(input: { actionPlanId: string }) {
        return this.actionPlanRepository.updateStatus({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.COMPLETED,
        })

    }
    async updateStatusToDelayed(input: { actionPlanId: string }) {
        return this.actionPlanRepository.updateStatus({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.DELAYED,
        })
    }
    async updateStatusToInProgress(input: { actionPlanId: string }) {
        return this.actionPlanRepository.updateStatus({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.IN_PROGRESS,
        })
    }
}
class LinePlanService implements ILinePlanService {
    constructor(
        private linePlanRepository: ILinePlanRepository,
        private actionPlanRepository: IActionPlanRepository,
    ) { }
    async syncStatusLinePlan(input: { linePlanId: string }) {
        const actionPlans = await this.actionPlanRepository.getAllByLinePlanId(input)
        const atLeastOneActionPlan = actionPlans.length > 0

        const isAtLeastOneDelay = actionPlans
            .some(isDelayed) && atLeastOneActionPlan

        if (isAtLeastOneDelay) {
            await this.updateStatusToDelayed(input)
            return null;
        }

        const isAllCompletedOrRejected = actionPlans
            .every(isCompletedOrRejected) && atLeastOneActionPlan

        if (isAllCompletedOrRejected) {
            await this.updateStatusToCompleted(input)
            return null;
        }

        await this.updateStatusToInProgress(input)
        return null;
    }
    async updateStatusToCompleted(input: { linePlanId: string }) {
        await this.linePlanRepository.updateStatus({
            linePlanId: input.linePlanId,
            status: LINE_PLAN_STATUS.COMPLETED,
        })
        return null;
    }
    async updateStatusToDelayed(input: { linePlanId: string }) {
        await this.linePlanRepository.updateStatus({
            linePlanId: input.linePlanId,
            status: LINE_PLAN_STATUS.DELAYED,
        })
        return null;
    }
    async updateStatusToInProgress(input: { linePlanId: string }) {
        await this.linePlanRepository.updateStatus({
            linePlanId: input.linePlanId,
            status: LINE_PLAN_STATUS.IN_PROGRESS,
        })
        return null;
    }
}

const isDelayed = (action: { status: string; }): boolean => action.status === ACTION_STATUS.DELAYED;
const isCompleted = (action: { status: string; }): boolean => action.status === ACTION_STATUS.COMPLETED;
const isRejected = (action: { status: string; }): boolean => action.status === ACTION_STATUS.REJECTED;
const isCompletedOrRejected = (action: { status: string; }): boolean => isCompleted(action) || isRejected(action);

export const createHandlersActionQB = (
    qb: QB
): (bus: IBus) => ActionEventHandlers => {
    const actionRepository = new ActionRepository(qb);
    const actionPlanRepository = new ActionPlanRepository(qb);
    const linePlanRepository = new LinePlanRepository(qb);

    return createHandlersAction(actionRepository, actionPlanRepository, linePlanRepository)
}

export const createHandlersAction = (
    actionRepository: IActionRepository,
    actionPlanRepository: IActionPlanRepository,
    linePlanRepository: ILinePlanRepository,
): (bus: IBus) => ActionEventHandlers => {
    return (bus) => {
        const actionService = new ActionService(actionRepository, bus);
        const actionPlanService = new ActionPlanService(actionPlanRepository, actionRepository);
        const linePlanService = new LinePlanService(linePlanRepository, actionPlanRepository);

        return {
            "action:created": async (input) => {
                log.info('action:created:start', { input })
                bus.emit('notification:actionCreated', { id: input.id })
                const { linePlanId } = await actionPlanService.syncStatusActionPlan(input);
                await linePlanService.syncStatusLinePlan({ linePlanId })
                log.info('action:created:end', { input })
                return null
            },
            "action:updated": async (input) => {
                log.info('action:updated:start', { input })
                bus.emit('notification:actionUpdated', { id: input.id })
                const { linePlanId } = await actionPlanService.syncStatusActionPlan(input);
                await linePlanService.syncStatusLinePlan({ linePlanId })
                log.info('action:updated:end', { input })
                return null
            },
            "action:imported": async (input) => {
                log.info('action:imported:start', { input })
                const actionPlanIds = await actionService.findExpiredActionsFromSelectedIdsAndUpdateStatusToDelayed(input)
                const linePlansIds = await Promise.all(actionPlanIds.map((actionPlanId) => actionPlanService.syncStatusActionPlan({ actionPlanId })))
                await Promise.all(linePlansIds.map(({ linePlanId }) => linePlanService.syncStatusLinePlan({ linePlanId })))
                log.info('action:imported:end', { input })
                return null
            },
            "action:syncStatuses": async (input) => {
                log.info('action:syncStatuses:start', { input })
                const actionPlanIds = await actionService.findAllExpiredActionsAndUpdateStatusToDelayed(input)
                const linePlansIds = await Promise.all(actionPlanIds.map((actionPlanId) => actionPlanService.syncStatusActionPlan({ actionPlanId })))
                await Promise.all(linePlansIds.map(({ linePlanId }) => linePlanService.syncStatusLinePlan({ linePlanId })))
                log.info('action:syncStatuses:end', { input })
                return null
            },
            "actionPlan:syncStatuses": async (input) => {
                log.info('actionPlan:syncStatuses:start', { input })
                const { linePlanId } = await actionPlanService.syncStatusActionPlan(input);
                await linePlanService.syncStatusLinePlan({ linePlanId })
                log.info('actionPlan:syncStatuses:end', { input })
                return null
            },
        }
    }
}
