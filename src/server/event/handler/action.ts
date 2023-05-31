import type { PrismaClient } from "@prisma/client";
import { ACTION_PLAN_STATUS } from '../../../utils/schema/action/actionPlan'
import { ACTION_STATUS } from "~/utils/schema/action/action";
import { type IBus } from "../bus";
import { LINE_PLAN_STATUS } from "~/utils/schema/action/linePlan";

export type ActionEventHandlers = {
    "action:created": (input: { actionPlanId: string }) => Promise<null>;
    "action:deleted": (input: { actionPlanId: string }) => Promise<null>;
    "action:updated": (input: { actionPlanId: string }) => Promise<null>;
    "actionPlan:allActionsCompletedOrDeletedOrDelayed": (input: { linePlanId: string }) => Promise<null>;
}

interface IActionRepository {
    getAllByActionPlanId: (input: { actionPlanId: string }) => Promise<{ status: string }[]>;
}

interface IActionPlanRepository {
    getAllByLinePlanId: (input: { linePlanId: string }) => Promise<{ status: string }[]>;
    updateStatus: (input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) => Promise<{
        id: string;
    }>;
}
interface ILinePlanRepository {
    updateStatus: (input: { linePlanId: string, status: keyof typeof LINE_PLAN_STATUS }) => Promise<null>;
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
        const actionPlans = await this.prisma.actionPlan.findMany({
            where: {
                linePlanId: input.linePlanId,
            },
            select: {
                status: true,
            }
        })
        return actionPlans;
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
                }
            }
        })
        return actionPlan;
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

const filterDeleted = (action: { status: string; }): boolean => action.status !== ACTION_STATUS.DELETED;
const isDelayed = (action: { status: string; }): boolean => action.status === ACTION_STATUS.DELEYED;
const isCompleted = (action: { status: string; }): boolean => action.status === ACTION_STATUS.COMPLETED;

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
    return (bus) => ({
        "actionPlan:allActionsCompletedOrDeletedOrDelayed": async (input) => {
            const actionPlans = await actionPlanRepository.getAllByLinePlanId({
                linePlanId: input.linePlanId,
            })

            const isAllCompleted = actionPlans
                .every(isCompleted)

            if (isAllCompleted) {
                await linePlanRepository.updateStatus({
                    linePlanId: input.linePlanId,
                    status: LINE_PLAN_STATUS.OK,
                })
                return null
            }

            await linePlanRepository.updateStatus({
                linePlanId: input.linePlanId,
                status: LINE_PLAN_STATUS.NOK,
            })
            return null;
        },
        "action:created": async (input) => {
            await actionPlanRepository.updateStatus({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS,
            })
            return null
        },
        "action:deleted": async (input) => {
            const actions = await actionRepository.getAllByActionPlanId({
                actionPlanId: input.actionPlanId,
            })

            const isAllCompleted = actions
                .filter(filterDeleted)
                .every(isCompleted)

            if (isAllCompleted) {
                const actionPlan = await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.COMPLETED,
                })
                bus.emit('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: actionPlan.id })
            }

            const isAllCompletedOrDelayed = actions
                .filter(filterDeleted)
                .every(action => isCompleted(action) || isDelayed(action))

            if (isAllCompletedOrDelayed) {
                const actionPlan = await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.DELEYED,
                })
                bus.emit('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: actionPlan.id })
                return null;
            }

            await actionPlanRepository.updateStatus({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS,
            })
            return null;
        },
        "action:updated": async (input) => {
            const actions = await actionRepository.getAllByActionPlanId({
                actionPlanId: input.actionPlanId,
            })

            const isAllCompleted = actions
                .filter(filterDeleted)
                .every(isCompleted)

            if (isAllCompleted) {
                const actionPlan = await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.COMPLETED,
                })
                bus.emit('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: actionPlan.id })
                return null;
            }

            const isAllCompletedOrDelayed = actions
                .filter(filterDeleted)
                .every(action => isCompleted(action) || isDelayed(action))

            if (isAllCompletedOrDelayed) {
                const actionPlan = await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.DELEYED,
                })
                bus.emit('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: actionPlan.id })
                return null;
            }

            await actionPlanRepository.updateStatus({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS,
            })
            return null;
        },
    }) as const
}
