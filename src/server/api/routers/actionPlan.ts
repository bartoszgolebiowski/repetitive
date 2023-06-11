import { TRPCError } from "@trpc/server";
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

            try {
                let query = ctx.qb
                    .selectFrom('ActionPlan')
                    .selectAll()
                    .where('ActionPlan.linePlanId', '=', linePlanId)

                if (status) {
                    query = query.where('status', 'in', status)
                }
                if (dueDate) {
                    query = query.where('dueDate', '<=', dueDate)
                }
                if (assignedTo) {
                    query = query.where('assignedTo', '=', assignedTo)
                }

                const actionPlan = await query.execute()
                return actionPlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    getById: protectedProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            try {
                const actionPlan = await ctx.qb
                    .selectFrom("ActionPlan")
                    .where("id", "=", input.id)
                    .selectAll()
                    .executeTakeFirst()

                if (!actionPlan) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Action plan not found',
                    });
                }
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
                const linePlan = await ctx.qb.insertInto("ActionPlan")
                    .values({
                        ...input,
                        updatedAt: new Date(),
                        createdAt: new Date(),
                        updatedBy: extractUserEmailOrId(ctx.auth),
                        createdBy: extractUserEmailOrId(ctx.auth),
                        status: ACTION_PLAN_STATUS.COMPLETED,
                    })
                    .returningAll()
                    .executeTakeFirst()

                return linePlan
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    update: protectedProcedure
        .input(actionPlanEditSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.qb
                    .updateTable("LinePlan")
                    .where("id", '=', input.id)
                    .set({
                        ...input,
                        updatedBy: extractUserEmailOrId(ctx.auth),
                        updatedAt: new Date(),
                    })
                    .returningAll()
                    .executeTakeFirst()

                return linePlan
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
