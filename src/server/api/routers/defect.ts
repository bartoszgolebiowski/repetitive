import { z } from "zod";

import { DEFECT_STATUS, defectsFilterSchema } from "~/utils/defect";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

type RemoveUndefined<T> = T extends undefined ? never : T;

export const checklistActionRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(defectsFilterSchema)
        .query(async ({ ctx, input }) => {
            const { organizationId, createdBy, assignedTo, status } = input;
            const where = {
                ...{ createdBy: createdBy ? { equals: createdBy } : {} },
                ...{ assignedTo: assignedTo ? { equals: assignedTo } : {} },
                ...{ status: status ? { in: status } : {} },
                ...{ plant: { organizationId: organizationId } },
                ...{ plantId: input.plantId ? { equals: input.plantId } : {} },
                ...{ definitionTaskId: input.definitionId ? { equals: input.definitionId } : {} },
            } satisfies RemoveUndefined<Parameters<typeof ctx.prisma.defect.findMany>['0']>['where']

            try {
                const actions = await ctx.prisma.defect.findMany({
                    where,
                    include: {
                        plant: {
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
                plantId: z.string(),
                actions:
                    z.array(z.object({
                        definitionTaskId: z.string(),
                        description: z.string(),
                        status: z.enum([
                            DEFECT_STATUS.TO_DO,
                            DEFECT_STATUS.ASSIGNED,
                            DEFECT_STATUS.DELETED,
                            DEFECT_STATUS.COMPLETED,
                        ]),
                        dueDate: z.date(),
                        assignedTo: z.string(),
                    }))
            }))
        .query(async ({ ctx, input }) => {
            try {
                const actions = await ctx.prisma.defect.createMany({
                    data: input.actions.map(action => ({
                        createdBy: ctx.session.user.email ?? ctx.session.user.id,
                        updatedBy: ctx.session.user.email ?? ctx.session.user.id,
                        description: action.description,
                        status: action.status,
                        dueDate: action.dueDate,
                        assignedTo: action.assignedTo,
                        definitionTaskId: action.definitionTaskId,
                        plantId: input.plantId,
                    })),
                })
                return actions
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
