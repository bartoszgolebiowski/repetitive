import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

export const userRouter = createTRPCRouter({
    getByplantId: protectedProcedure
        .input(z.object({ plantId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const userInsidePlant = await ctx.prisma.user.findMany({
                    select: {
                        email: true,
                    },
                    where: {
                        memberships: {
                            some: {
                                organization: {
                                    plant: {
                                        some: {
                                            id: input.plantId
                                        }
                                    }
                                }
                            }
                        }
                    },
                })
                return userInsidePlant
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    getByOrganizationId: protectedProcedure
        .input(z.object({ organizationId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const userInsideOrganization = await ctx.prisma.user.findMany({
                    select: {
                        email: true,
                    },
                    where: {
                        memberships: {
                            some: {
                                organizationId: input.organizationId
                            }
                        }
                    },
                })

                return userInsideOrganization
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
