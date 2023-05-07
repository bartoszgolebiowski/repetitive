import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { organizationSchema, plantSchema, linePlanSchema } from "~/utils/schema/general";
import { TRPCError } from "@trpc/server";

const USER_ERRORS = {
    LINE_PLAN_NOT_FOUND: {
        code: 'NOT_FOUND' as const,
        message: 'Line plan not found.',
    },
}

export const userRouter = createTRPCRouter({
    getByLinePlanId: protectedProcedure
        .input(linePlanSchema)
        .query(async ({ ctx, input }) => {
            try {

                const linePlan = await ctx.prisma.linePlan.findUnique({
                    where: {
                        id: input.linePlanId
                    },
                    select: {
                        organization: {
                            select: {
                                id: true
                            }
                        }
                    }
                })

                if (!linePlan) throw new TRPCError(USER_ERRORS.LINE_PLAN_NOT_FOUND);

                const userInsidePlant = await ctx.prisma.user.findMany({
                    select: {
                        email: true,
                    },
                    where: {
                        memberships: {
                            some: {
                                organizationId: linePlan.organization.id
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

    getByPlantId: protectedProcedure
        .input(plantSchema)
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
                                    plants: {
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
        .input(organizationSchema)
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
