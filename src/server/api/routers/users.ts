import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { organizationSchema, plantSchema } from "~/utils/schema/general";

export const userRouter = createTRPCRouter({
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
