import type { PrismaClient } from "@prisma/client";
import { ACTION_PLAN_STATUS } from '../../../utils/schema/action/actionPlan'
import { ACTION_STATUS } from "~/utils/schema/action/action";

export type ActionEventHandlers = {
    "action:created": (input: { actionPlanId: string }) => Promise<null>;
    "action:deleted": (input: { actionPlanId: string }) => Promise<null>;
    "action:updated": (input: { actionPlanId: string }) => Promise<null>;
}

interface IActionRepository {
    getAllByActionPlanId: (input: { actionPlanId: string }) => Promise<{ status: string }[]>;
}

interface IActionPlanRepository {
    updateStatus: (input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) => Promise<null>;
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
    async updateStatus(input: { actionPlanId: string, status: keyof typeof ACTION_PLAN_STATUS }) {
        await this.prisma.actionPlan.update({
            where: {
                id: input.actionPlanId,
            },
            data: {
                status: input.status,
            }
        })
        return null;
    }
}
const filterDeleted = (action: { status: string; }): boolean => action.status !== ACTION_STATUS.DELETED;
const isCompleted = (action: { status: string; }): boolean => action.status === ACTION_STATUS.COMPLETED;


export const createHandlersActionPrisma = (
    prisma: PrismaClient,
): ActionEventHandlers => {
    const actionRepository = new ActionRepository(prisma);
    const actionPlanRepository = new ActionPlanRepository(prisma);

    return createHandlersActionRepositories(actionRepository, actionPlanRepository)
}

export const createHandlersActionRepositories = (
    actionRepository: IActionRepository,
    actionPlanRepository: IActionPlanRepository,
): ActionEventHandlers => {
    return {
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
                await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.COMPLETED,
                })
            }
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
                await actionPlanRepository.updateStatus({
                    actionPlanId: input.actionPlanId,
                    status: ACTION_PLAN_STATUS.COMPLETED,
                })
                return null;
            }

            await actionPlanRepository.updateStatus({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS,
            })
            return null;
        },
    } as const
}
