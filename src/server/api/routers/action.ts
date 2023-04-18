import { z } from "zod";

import { ACTION_STATUS, actionFilterSchema } from "~/utils/action";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

type RemoveUndefined<T> = T extends undefined ? never : T;

export const actionRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(actionFilterSchema)
        .query(async ({ ctx, input }) => {
            const { organizationId, createdBy, assignedTo, status } = input;
            const where = {
                ...{ createdBy: createdBy ? { equals: createdBy } : {} },
                ...{ assignedTo: assignedTo ? { equals: assignedTo } : {} },
                ...{ status: status ? { in: status } : {} },
                ...{ workplace: { organizationId: organizationId } },
                ...{ workplaceId: input.workplaceId ? { equals: input.workplaceId } : {} },
                ...{ definitionTaskId: input.definitionId ? { equals: input.definitionId } : {} },
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.action.findMany>['0']>['where']

            try {
                const actions = await ctx.prisma.action.findMany({
                    where,
                    include: {
                        workplace: {
                            select: {
                                id: true,
                                name: true,
                            }
                        },
                        definitionTask: {
                            include: {
                                definition: {
                                    select: {
                                        id: true,
                                        name: true,
                                    }
                                }
                            }
                        }
                    }
                });
                return actions;
            } catch (error) {
                handleErrorRouter(error);
            }
        }),
    createMany: protectedProcedure
        .input(
            z.object({
                workplaceId: z.string(),
                actions:
                    z.array(z.object({
                        definitionTaskId: z.string(),
                        description: z.string(),
                        status: z.enum([
                            ACTION_STATUS.TO_DO,
                            ACTION_STATUS.ASSIGNED,
                            ACTION_STATUS.DELETED,
                            ACTION_STATUS.COMPLETED,
                        ]),
                        dueDate: z.date(),
                        assignedTo: z.string(),
                    }))
            }))
        .query(async ({ ctx, input }) => {
            try {
                const actions = await ctx.prisma.action.createMany({
                    data: input.actions.map(action => ({
                        createdBy: ctx.session.user.email ?? ctx.session.user.id,
                        updatedBy: ctx.session.user.email ?? ctx.session.user.id,
                        description: action.description,
                        status: action.status,
                        dueDate: action.dueDate,
                        assignedTo: action.assignedTo,
                        definitionTaskId: action.definitionTaskId,
                        workplaceId: input.workplaceId,
                    })),
                })
                return actions
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
