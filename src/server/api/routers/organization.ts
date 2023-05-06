
import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { isAdmin, ROLES } from "../roles";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { createSchema } from "~/utils/schema/organization";

export const organizationRouter = createTRPCRouter({
    getMy: protectedProcedure
        .query(async ({ ctx, }) => {
            const userId = ctx.session.user.id;
            try {
                const myOrganizations = await ctx.prisma.organization.findMany({
                    where: {
                        memberships: {
                            some: {
                                userId,
                            },
                        },
                    },
                    include: {
                        memberships: true,
                    }
                })

                return myOrganizations.map((organization) => ({
                    ...organization,
                    isAdmin:
                        organization.memberships.some((membership) => membership.userId === userId && isAdmin(membership)),
                }));
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(createSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const organization = await ctx.prisma.organization.create({
                    data: {
                        name: input.name,
                    },
                })

                await ctx.prisma.membership.create({
                    data: {
                        organizationId: organization.id,
                        userId: ctx.session.user.id,
                        role: ROLES.ADMIN,
                    },
                })

                return organization
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
