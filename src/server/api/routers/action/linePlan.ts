import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { LINE_PLAN_STATUS, linePlanFilterSchema, linePlanItemCreateSchema, linePlanItemEditSchema } from "~/utils/schema/action/linePlan";
import { handleErrorRouter } from "~/utils/httpErrors";
import { extractEmailOrUserId } from "~/utils/user";

type RemoveUndefined<T> = T extends undefined ? never : T;

export const linePlanRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(linePlanFilterSchema)
        .query(async ({ ctx, input }) => {
            const { organizationId, dueDate, productionLine, assignedTo, status } = input;
            const where = {
                organizationId: organizationId,
                ...{ dueDate: dueDate ? { lte: dueDate } : {} },
                ...{ assignedTo: assignedTo ? { equals: assignedTo } : {} },
                ...{ productionLine: productionLine ? { equals: productionLine } : {} },
                ...{ status: status ? { in: status } : {} },
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.linePlan.findMany>['0']>['where']

            try {
                const linePlans = await ctx.prisma.linePlan.findMany({
                    where,
                });

                return linePlans;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(linePlanItemCreateSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const linePlan = await ctx.prisma.linePlan.create({
                    data: {
                        ...input,
                        createdBy: extractEmailOrUserId(ctx.session),
                        updatedBy: extractEmailOrUserId(ctx.session),
                        status: LINE_PLAN_STATUS.OK,
                        comment: input.comment,
                    },
                });

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
