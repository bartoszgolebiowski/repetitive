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
}

interface IActionRepository {
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

class ActionPlanService implements IActionPlanService {
    constructor(private actionPlanRepository: IActionPlanRepository) { }
    async updateStatusToCompleted(input: { actionPlanId: string }) {
        return await this.actionPlanRepository.updateStatus({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.COMPLETED,
        })

    }
    async updateStatusToDelayed(input: { actionPlanId: string }) {
        return await this.actionPlanRepository.updateStatus({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.DELAYED,
        })
    }
    async updateStatusToInProgress(input: { actionPlanId: string }) {
        return await this.actionPlanRepository.updateStatus({
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

const filterDeleted = (action: { status: string; }): boolean => action.status !== ACTION_STATUS.DELETED;
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
        const actionPlanService = new ActionPlanService(actionPlanRepository);
        const linePlanService = new LinePlanService(linePlanRepository);

        const linePlanUpdate = async (linePlanId: string) => {
            const actionPlans = await actionPlanRepository.getAllByLinePlanId({ linePlanId })

            const isAllCompletedOrRejected = actionPlans
                .filter(filterDeleted)
                .every(isCompletedOrRejected)

            if (isAllCompletedOrRejected) {
                await linePlanService.updateStatusToCompleted({ linePlanId })
                return null;
            }

            const isAtLeastOneDelay = actionPlans
                .filter(filterDeleted)
                .some(isDelayed)

            if (isAtLeastOneDelay) {
                await linePlanService.updateStatusToDelayed({ linePlanId })
                return null;
            }

            await linePlanService.updateStatusToInProgress({ linePlanId })
            return null;
        }

        const actionPlanUpdateAndEventEmit = async (actionPlanId: string) => {
            const actions = await actionRepository.getAllByActionPlanId({
                actionPlanId
            })

            const isAllCompleted = actions
                .filter(filterDeleted)
                .every(isCompletedOrRejected)

            if (isAllCompleted) {
                const actionPlan = await actionPlanService.updateStatusToCompleted({ actionPlanId })
                bus.emit('actionPlan:allActionsCompletedOrRejected', { actionPlanId: actionPlan.id })
                return null;
            }

            const isAtLeastOneDelay = actions
                .filter(filterDeleted)
                .some(isDelayed)

            if (isAtLeastOneDelay) {
                const actionPlan = await actionPlanService.updateStatusToDelayed({ actionPlanId })
                bus.emit('actionPlan:atLeastOneActionDelayed', { actionPlanId: actionPlan.id })
                return null;
            }

            await actionPlanService.updateStatusToInProgress({ actionPlanId })
            return null;
        }

        return {
            "actionPlan:allActionsCompletedOrRejected": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToCompleted(input)
                return linePlanUpdate(linePlanId)
            },
            "actionPlan:atLeastOneActionDelayed": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToDelayed(input)
                await linePlanService.updateStatusToDelayed({ linePlanId })
                return null;
            },
            "action:created": async (input) => {
                const { linePlanId } = await actionPlanService.updateStatusToInProgress(input)
                return linePlanUpdate(linePlanId)
            },
            "action:deleted": async (input) => {
                return actionPlanUpdateAndEventEmit(input.actionPlanId)
            },
            "action:updated": async (input) => {
                return actionPlanUpdateAndEventEmit(input.actionPlanId)
            },
        }
    }
}
