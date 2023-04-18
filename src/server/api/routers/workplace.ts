import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

export const workplaceRouter = createTRPCRouter({
    getMyWorkplaces: protectedProcedure
        .query(async ({ ctx }) => {
            const userId = ctx.session.user.id;
            try {
                const myWorkplaces = await ctx.prisma.workplace.findMany({
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
                return myWorkplaces
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const workplace = await ctx.prisma.workplace.findUnique({
                    where: {
                        id: input.id,
                    },
                    include: {
                        organization: true
                    }
                });

                return workplace
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    getByOrganizationId: protectedProcedure
        .input(z.object({ organizationId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const myWorkplaces = await ctx.prisma.workplace.findMany({
                    where: {
                        organizationId: input.organizationId,
                    },
                    include: {
                        organization: true
                    }
                });

                return myWorkplaces
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
                const workplace = await ctx.prisma.workplace.create({
                    data: {
                        organizationId: input.organizationId,
                        name: input.name,
                    },
                })

                return workplace
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
