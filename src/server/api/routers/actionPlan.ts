import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";
import { ACTION_PLAN_STATUS, actionPlanCreateSchema, actionPlanEditSchema, actionPlanFilterSchema } from "~/utils/schema/action/actionPlan";
import { byIdSchema } from "~/utils/schema/general";
import { extractUserEmailOrId } from "~/utils/user";

export const actionPlanRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(actionPlanFilterSchema)
        .query(async ({ ctx, input }) => {
            const { linePlanId, dueDate, assignedTo, status } = input;
            const where = {
                linePlanId: linePlanId,
                ...{ dueDate: dueDate ? { lte: dueDate } : {} },
                ...{ assignedTo: assignedTo ? { equals: assignedTo } : {} },
                ...{ status: status ? { in: status } : {} },
            }

            try {
                const linePlans = await ctx.prisma.actionPlan.findMany({
                    where,
                    select: {
                        id: true,
                        status: true,
                        name: true,
                        description: true,
                        assignedTo: true,
                        dueDate: true,
                        createdAt: true,
                        updatedAt: true,
                    }
                });

                return linePlans;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    getById: protectedProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            try {
                const actionPlan = await ctx.prisma.actionPlan.findUnique({
                    where: {
                        id: input.id,
                    },
                });

                return actionPlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(actionPlanCreateSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.prisma.actionPlan.create({
                    data: {
                        ...input,
                        createdBy: extractUserEmailOrId(ctx.auth),
                        updatedBy: extractUserEmailOrId(ctx.auth),
                        status: ACTION_PLAN_STATUS.COMPLETED,
                    },
                });

                return linePlan;

            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    update: protectedProcedure
        .input(actionPlanEditSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.prisma.linePlan.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        ...input,
                        updatedBy: extractUserEmailOrId(ctx.auth),
                    },
                });

                return linePlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
