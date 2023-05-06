import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

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
        .input(z.object({ id: z.string() }))
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
        .input(z.object({ organizationId: z.string() }))
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
        .input(z.object({
            organizationId: z.string(),
            name: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const plant = await ctx.prisma.plant.create({
                    data: {
                        organizationId: input.organizationId,
                        name: input.name,
                    },
                })

                return plant
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
