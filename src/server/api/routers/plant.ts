import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { createSchema } from "~/utils/schema/plant";
import { byIdSchema, organizationSchema } from "~/utils/schema/general";

export const plantRouter = createTRPCRouter({
    getMy: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            try {
                const myPlants = await ctx.prisma.plant.findMany({
                    where: {
                        organization: {
                            memberships: {
                                some: {
                                    user: {
                                        id: userId
                                    }
                                }
                            }
                        }
                    },
                    include: {
                        organization: true
                    }
                })
                return myPlants
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    getById: protectedProcedure
        .input(byIdSchema)
        .query(async ({ ctx, input }) => {
            try {
                const plant = await ctx.prisma.plant.findUnique({
                    where: {
                        id: input.id,
                    },
                    include: {
                        organization: true
                    }
                });

                return plant
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    getByOrganizationId: protectedProcedure
        .input(organizationSchema)
        .query(async ({ ctx, input }) => {
            try {
                const myPlants = await ctx.prisma.plant.findMany({
                    where: {
                        organizationId: input.organizationId,
                    },
                    include: {
                        organization: true
                    }
                });

                return myPlants
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(createSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const plant = await ctx.prisma.plant.create({
                    data: input
                })

                return plant
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
