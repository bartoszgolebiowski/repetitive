import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

export const userRouter = createTRPCRouter({
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
