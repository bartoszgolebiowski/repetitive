import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { LINE_PLAN_STATUS, linePlanFilterSchema, linePlanItemCreateSchema, linePlanItemEditSchema } from "~/utils/schema/action/linePlan";
import { handleErrorRouter } from "~/utils/httpErrors";
import { extractUserEmailOrId } from "~/utils/user";
import { byIdSchema } from "~/utils/schema/general";
import { TRPCError } from "@trpc/server";

export const linePlanRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(linePlanFilterSchema)
        .query(async ({ ctx, input }) => {
            const { organizationId, dueDate, productionLine, assignedTo, status } = input;

            try {
                let query = ctx.qb
                    .selectFrom('LinePlan')
                    .selectAll()
                    .where('organizationId', '=', organizationId)

                if (status) {
                    query = query.where('status', 'in', status)
                }
                if (dueDate) {
                    query = query.where('dueDate', '<=', dueDate)
                }
                if (assignedTo) {
                    query = query.where('assignedTo', '=', assignedTo)
                }
                if (productionLine) {
                    query = query.where('productionLine', '=', productionLine)
                }

                const linePlans = await query.execute();
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
                const linePlan = await ctx.qb
                    .selectFrom("LinePlan")
                    .selectAll()
                    .where('id', '=', input.id)
                    .executeTakeFirstOrThrow()

                if (!linePlan) {
                    throw new TRPCError({
                        code: 'NOT_FOUND',
                        message: 'Line plan not found',
                    });
                }
                return linePlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(linePlanItemCreateSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.qb
                    .insertInto("LinePlan")
                    .values({
                        ...input,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: extractUserEmailOrId(ctx.auth),
                        updatedBy: extractUserEmailOrId(ctx.auth),
                        status: LINE_PLAN_STATUS.COMPLETED,
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return linePlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    update: protectedProcedure
        .input(linePlanItemEditSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.qb
                    .updateTable("LinePlan")
                    .set({
                        ...input,
                        updatedAt: new Date(),
                        updatedBy: extractUserEmailOrId(ctx.auth),
                    })
                    .returningAll()
                    .executeTakeFirstOrThrow()

                return linePlan;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
