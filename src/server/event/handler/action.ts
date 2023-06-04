import type { PrismaClient } from "@prisma/client";
import { ACTION_PLAN_STATUS } from '../../../utils/schema/action/actionPlan'
import { ACTION_STATUS } from "~/utils/schema/action/action";
import { type IBus } from "../bus";
import { LINE_PLAN_STATUS } from "~/utils/schema/action/linePlan";

export type ActionEventHandlers = {
    "action:created": (input: { actionPlanId: string }) => Promise<null>;
    "action:deleted": (input: { actionPlanId: string }) => Promise<null>;
    "action:updated": (input: { actionPlanId: string }) => Promise<null>;
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
}

class ActionRepository implements IActionRepository {
    constructor(private prisma: PrismaClient) { }
    async getAllExpiredActions(now: Date) {
        const actions = await this.prisma.action.findMany({
            where: {
                status: {
                    in: ACTION_STATUS.IN_PROGRESS
                },
                dueDate: {
                    lte: now
                }
            },
            select: {
                id: true,
                actionPlanId: true,
            }
        })
        return actions;
    }
    async getAllByActionPlanId(input: { actionPlanId: string }) {
        const actions = await this.prisma.action.findMany({
            where: {
                actionPlanId: input.actionPlanId,
            },
            select: {
                status: true,
            }
        })
        return actions;
    }
    async updateManyStatus(input: { ids: string[], status: keyof typeof ACTION_STATUS }) {
        const action = await this.prisma.action.updateMany({
            where: {
                id: {
                    in: input.ids,
                },
            },
            data: {
                status: input.status,
            },
        })
        return action
    }
}
class ActionPlanRepository implements IActionPlanRepository {
    constructor(private prisma: PrismaClient) { }
    async getAllByLinePlanId(input: { linePlanId: string }) {
        const actions = await this.prisma.actionPlan.findMany({
            where: {
                linePlanId: input.linePlanId,
            },
            select: {
                status: true,
            }
        })
        return actions;
    }
    async updateStatus(input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) {
        const actionPlan = await this.prisma.actionPlan.update({
            where: {
                id: input.actionPlanId,
            },
            data: {
                status: input.status,
            },
            include: {
                linePlan: {
                    select: {
                        id: true,
                    }
                },
            }
        })
        return actionPlan
    }
}

class LinePlanRepository implements ILinePlanRepository {
    constructor(private prisma: PrismaClient) { }
    async updateStatus(input: { linePlanId: string, status: keyof typeof LINE_PLAN_STATUS }) {
        await this.prisma.linePlan.update({
            where: {
                id: input.linePlanId,
            },
            data: {
                status: input.status,
            },
        })
        return null;
    }
}

class ActionService implements IActionService {
    constructor(private actionRepository: IActionRepository) { }
    async updateExpiredActionsStatusToDelayed(input: { expiryDate: Date }) {
        const expiredActions = await this.actionRepository.getAllExpiredActions(input.expiryDate);
        await this.updateManyStatusesToDelayed({ ids: expiredActions.map(action => action.id) })
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
    constructor(private actionPlanRepository: IActionPlanRepository) { }
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
    constructor(private linePlanRepository: ILinePlanRepository) { }
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

export const createHandlersActionPrisma = (
    prisma: PrismaClient,
): (bus: IBus) => ActionEventHandlers => {
    const actionRepository = new ActionRepository(prisma);
    const actionPlanRepository = new ActionPlanRepository(prisma);
    const linePlanRepository = new LinePlanRepository(prisma);

    return createHandlersActionRepositories(actionRepository, actionPlanRepository, linePlanRepository)
}

export const createHandlersActionRepositories = (
    actionRepository: IActionRepository,
    actionPlanRepository: IActionPlanRepository,
    linePlanRepository: ILinePlanRepository,
): (bus: IBus) => ActionEventHandlers => {
    return (bus) => {
        const actionService = new ActionService(actionRepository);
        const actionPlanService = new ActionPlanService(actionPlanRepository);
        const linePlanService = new LinePlanService(linePlanRepository);

        const syncStatusLinePlan = async (linePlanId: string) => {
            const actionPlans = await actionPlanRepository.getAllByLinePlanId({ linePlanId })

            const isAtLeastOneDelay = actionPlans
                .some(isDelayed)

            if (isAtLeastOneDelay) {
                await linePlanService.updateStatusToDelayed({ linePlanId })
                return null;
            }

            const isAllCompletedOrRejected = actionPlans
                .every(isCompletedOrRejected)

            if (isAllCompletedOrRejected) {
                await linePlanService.updateStatusToCompleted({ linePlanId })
                return null;
            }

            await linePlanService.updateStatusToInProgress({ linePlanId })
            return null;
        }

        const syncStatusActionPlan = async (actionPlanId: string) => {
            const actions = await actionRepository.getAllByActionPlanId({
                actionPlanId
            })

            const isAtLeastOneActionDelay = actions
                .some(isDelayed)

            if (isAtLeastOneActionDelay) {
                const actionPlan = await actionPlanService.updateStatusToDelayed({ actionPlanId })
                bus.emit('actionPlan:atLeastOneActionDelayed', { actionPlanId: actionPlan.id })
                return null;
            }

            const isAllActionsCompleted = actions
                .every(isCompletedOrRejected) && actions.length > 0

            if (isAllActionsCompleted) {
                const actionPlan = await actionPlanService.updateStatusToCompleted({ actionPlanId })
                bus.emit('actionPlan:allActionsCompletedOrRejected', { actionPlanId: actionPlan.id })
                return null;
            }

            await actionPlanService.updateStatusToInProgress({ actionPlanId })
            return null;
        }

        return {
            "action:markExpired": async (input) => {
                const actionPlanIds = await actionService.updateExpiredActionsStatusToDelayed(input)
                await Promise.all(actionPlanIds.map(syncStatusActionPlan))
                return null
            },
            "actionPlan:atLeastOneActionDelayed": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToDelayed(input)
                return linePlanService.updateStatusToDelayed({ linePlanId })
            },
            "actionPlan:allActionsCompletedOrRejected": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToCompleted(input)
                return syncStatusLinePlan(linePlanId)
            },
            "action:created": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToInProgress(input)
                return syncStatusLinePlan(linePlanId)
            },
            "action:deleted": async ({ actionPlanId }) => {
                return syncStatusActionPlan(actionPlanId);
            },
            "action:updated": async ({ actionPlanId }) => {
                return syncStatusActionPlan(actionPlanId);
            }
        }
    }
}
