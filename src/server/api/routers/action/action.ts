import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";
import { actionEditItemSchema, actionFilterSchema, actionItemSchema, ACTION_STATUS } from "~/utils/schema/action/action";
import { byIdSchema } from "~/utils/schema/general";
import { extractEmailOrUserId } from "~/utils/user";

type RemoveUndefined<T> = T extends undefined ? never : T;

export const actionRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(actionFilterSchema)
        .query(async ({ ctx, input }) => {
            const { actionPlanId, leader, priority, startDate, dueDate, assignedTo, status } = input.filters;
            const { field, direction } = input?.orderBy || { field: 'dueDate', direction: 'asc' };
            const where = {
                actionPlanId: actionPlanId,
                ...{ leader: leader ? { equals: leader } : {} },
                ...{ priority: priority ? { in: priority } : {} },
                ...{ startDate: startDate ? { lte: startDate } : {} },
                ...{ dueDate: dueDate ? { lte: dueDate } : {} },
                ...{ assignedTo: assignedTo ? { equals: assignedTo } : {} },
                ...{ status: status ? { in: status } : {} },
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.action.findMany>['0']>['where']

            const orderBy = {
                [field]: direction,
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.action.findMany>['0']>['orderBy']

            try {
                const linePlans = await ctx.prisma.action.findMany({
                    where,
                    orderBy,
                });

                return linePlans;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(actionItemSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const action = await ctx.prisma.action.create({
                    data: {
                        ...input,
                        createdBy: extractEmailOrUserId(ctx.session),
                        updatedBy: extractEmailOrUserId(ctx.session),
                    },
                });

                ctx.bus.emit('action:created', { actionPlanId: action.actionPlanId });

                return action;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    delete: protectedProcedure
        .input(byIdSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const action = await ctx.prisma.action.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        status: ACTION_STATUS.DELETED,
                    },
                });

                ctx.bus.emit('action:deleted', { actionPlanId: action.actionPlanId });

                return action;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    update: protectedProcedure
        .input(actionEditItemSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const action = await ctx.prisma.action.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        ...input,
                        createdBy: extractEmailOrUserId(ctx.session),
                        updatedBy: extractEmailOrUserId(ctx.session),
                    },
                });

                ctx.bus.emit('action:updated', { actionPlanId: action.actionPlanId });

                return action;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});