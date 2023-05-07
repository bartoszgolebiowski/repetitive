import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";
import { ACTION_PLAN_STATUS, actionPlanCreateSchema, actionPlanEditSchema, actionPlanFilterSchema } from "~/utils/schema/action/actionPlan";
import { extractEmailOrUserId } from "~/utils/user";

type RemoveUndefined<T> = T extends undefined ? never : T;

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
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.actionPlan.findMany>['0']>['where']

            try {
                const linePlans = await ctx.prisma.actionPlan.findMany({
                    where,
                });

                return linePlans;
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
                        createdBy: extractEmailOrUserId(ctx.session),
                        updatedBy: extractEmailOrUserId(ctx.session),
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
                        updatedBy: extractEmailOrUserId(ctx.session),
                    },
                });

                return linePlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});