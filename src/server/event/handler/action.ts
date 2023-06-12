import { ACTION_PLAN_STATUS } from '~/utils/schema/action/actionPlan'
import { ACTION_STATUS } from "~/utils/schema/action/action";
import { LINE_PLAN_STATUS } from "~/utils/schema/action/linePlan";
import { type QB } from '~/server/db';
import { type IBus } from "../bus";

export type ActionEventHandlers = {
    "action:created": (input: { actionPlanId: string }) => Promise<null>;
    "action:updated": (input: { id: string, actionPlanId: string }) => Promise<null>;
    "actionPlan:allActionsCompletedOrRejected": (input: { actionPlanId: string }) => Promise<null>;
    "actionPlan:atLeastOneActionDelayed": (input: { actionPlanId: string }) => Promise<null>;
    "action:markExpired": (input: { expiryDate: Date }) => Promise<null>;
}

interface IActionRepository {
    updateManyStatus: (input: { ids: string[], status: keyof typeof ACTION_STATUS }) => Promise<{ count: number }>;
    getAllExpiredActions: (now: Date) => Promise<{ id: string, actionPlanId: string }[]>;
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
    updateExpiredActionsStatusToDelayed: (input: { expiryDate: Date }) => Promise<string[]>;
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
    async getAllExpiredActions(now: Date) {
        const actions = await this.qb
            .selectFrom('Action')
            .select(['id', 'actionPlanId'])
            .where('status', '=', ACTION_STATUS.IN_PROGRESS)
            .where('dueDate', '<', now)
            .execute()

        return actions
    }
    async getAllByActionPlanId(input: { actionPlanId: string }) {
        const actions = await this.qb
            .selectFrom('Action')
            .select(['status'])
            .where('actionPlanId', '=', input.actionPlanId)
            .execute()
        return actions;
    }
    async updateManyStatus(input: { ids: string[], status: keyof typeof ACTION_STATUS }) {
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
    }
}
class ActionPlanRepository implements IActionPlanRepository {
    constructor(private qb: QB) { }
    async getAllByLinePlanId(input: { linePlanId: string }) {
        const actions = await this.qb
            .selectFrom('ActionPlan')
            .select('status')
            .where('linePlanId', '=', input.linePlanId)
            .execute()

        return actions;
    }
    async updateStatus(input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) {
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
    }
}

class LinePlanRepository implements ILinePlanRepository {
    constructor(private qb: QB) { }
    async updateStatus(input: { linePlanId: string, status: keyof typeof LINE_PLAN_STATUS }) {
        await this.qb
            .updateTable('LinePlan')
            .set({
                status: input.status,
            })
            .where('id', '=', input.linePlanId)
            .execute()

        return null;
    }
}
class ActionService implements IActionService {
    constructor(private actionRepository: IActionRepository, private bus: IBus) { }
    async updateExpiredActionsStatusToDelayed(input: { expiryDate: Date }) {
        const expiredActions = await this.actionRepository.getAllExpiredActions(input.expiryDate);
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
        private bus: IBus
    ) { }
    async syncStatusActionPlan(input: { actionPlanId: string }) {
        const actions = await this.actionRepository.getAllByActionPlanId(input)

        const isAtLeastOneActionDelay = actions
            .some(isDelayed)

        if (isAtLeastOneActionDelay) {
            const actionPlan = await this.updateStatusToDelayed(input)
            this.bus.emit('actionPlan:atLeastOneActionDelayed', input)
            return { linePlanId: actionPlan.linePlanId };
        }

        const isAllActionsCompleted = actions
            .every(isCompletedOrRejected) && actions.length > 0

        if (isAllActionsCompleted) {
            const actionPlan = await this.updateStatusToCompleted(input)
            this.bus.emit('actionPlan:allActionsCompletedOrRejected', input)
            return { linePlanId: actionPlan.linePlanId };
        }

        const actionPlan = await this.updateStatusToInProgress(input)
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

        const isAtLeastOneDelay = actionPlans
            .some(isDelayed)

        if (isAtLeastOneDelay) {
            await this.updateStatusToDelayed(input)
            return null;
        }

        const isAllCompletedOrRejected = actionPlans
            .every(isCompletedOrRejected)

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
        const actionPlanService = new ActionPlanService(actionPlanRepository, actionRepository, bus);
        const linePlanService = new LinePlanService(linePlanRepository, actionPlanRepository);

        return {
            "action:markExpired": async (input) => {
                const actionPlanIds = await actionService.updateExpiredActionsStatusToDelayed(input)
                await Promise.all(actionPlanIds.map((actionPlanId) => actionPlanService.syncStatusActionPlan({ actionPlanId })))
                return null
            },
            "actionPlan:atLeastOneActionDelayed": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToDelayed(input)
                return linePlanService.updateStatusToDelayed({ linePlanId })
            },
            "actionPlan:allActionsCompletedOrRejected": async (input) => {
                const { linePlanId } = await actionPlanService.syncStatusActionPlan(input);
                return linePlanService.syncStatusLinePlan({ linePlanId })
            },
            "action:created": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToInProgress(input)
                return linePlanService.syncStatusLinePlan({ linePlanId })
            },
            "action:updated": async ({ actionPlanId, id }) => {
                bus.emit('notification:actionUpdate', { id })
                await actionPlanService.syncStatusActionPlan({ actionPlanId });
                return null
            }
        }
    }
}
