
import { getDefectsSchema, defectCreateManySchema } from "~/utils/schema/defect";
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { extractEmailOrUserId } from "~/utils/user";

type RemoveUndefined<T> = T extends undefined ? never : T;

export const checklistActionRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(getDefectsSchema)
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
        .input(defectCreateManySchema)
        .query(async ({ ctx, input }) => {
            try {
                const actions = await ctx.prisma.defect.createMany({
                    data: input.actions.map(action => ({
                        createdBy: extractEmailOrUserId(ctx.session),
                        updatedBy: extractEmailOrUserId(ctx.session),
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
