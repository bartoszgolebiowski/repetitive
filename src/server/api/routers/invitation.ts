import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { isAdmin, ROLES } from "../roles";
import { handleErrorRouter } from "../../../utils/httpErrors";

export const INVITATION_ERRORS = {
    ORGANIZATION_NOT_FOUND: {
        code: 'NOT_FOUND' as const,
        message: 'Organization not found.',
    },
    INVITATION_NOT_FOUND: {
        code: 'NOT_FOUND' as const,
        message: 'Invitation not found.',
    },
    INVINTATION_WRONG_STATUS: {
        code: 'FORBIDDEN' as const,
        message: 'Invitation has already been accepted or rejected.',
    },
    USER_ALREADY_IN_ORGANIZATION: {
        code: 'FORBIDDEN' as const,
        message: 'User is already in this organization.',
    },
    USER_CREATE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN: {
        code: 'FORBIDDEN' as const,
        message: 'You do not have permission to create an invitation for this organization.',
    },
    USER_DELETE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN: {
        code: 'FORBIDDEN' as const,
        message: 'You do not have permission to delete an invitation for this organization.',
    }
}

export const INVITATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
} as const;

export const invitationRouter = createTRPCRouter({
    getByOrganizationId: protectedProcedure
        .input(z.object({ organizationId: z.string(), }))
        .query(async ({ ctx, input }) => {
            const organizationId = input.organizationId;
            try {
                const invitations = await ctx.prisma.invitation.findMany({
                    where: {
                        organizationId: organizationId,
                    },
                })

                return invitations
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    accept: protectedProcedure
        .input(z.object({ id: z.string(), organizationId: z.string(), }))
        .mutation(async ({ input, ctx }) => {
            try {
                const [
                    invitation,
                    organization,
                    isUserAlreadyInOrganization,
                ] = await Promise.all([
                    ctx.prisma.invitation.findFirst({
                        where: {
                            id: input.id,
                        },
                        include: {
                            organization: true,
                        }
                    }),
                    ctx.prisma.organization.findFirst({
                        where: {
                            id: input.organizationId,
                        },
                    }),
                    ctx.prisma.membership.findFirst({
                        where: {
                            organizationId: input.organizationId,
                            userId: ctx.session.user.id,
                        }
                    })
                ])

                if (!invitation) {
                    throw new TRPCError(INVITATION_ERRORS.INVITATION_NOT_FOUND);
                }

                if (!organization) {
                    throw new TRPCError(INVITATION_ERRORS.ORGANIZATION_NOT_FOUND);
                }

                if (invitation.status !== INVITATION_STATUS.PENDING) {
                    throw new TRPCError(INVITATION_ERRORS.INVINTATION_WRONG_STATUS);
                }

                if (isUserAlreadyInOrganization) {
                    await ctx.prisma.invitation.update({
                        where: {
                            id: invitation.id,
                        },
                        data: {
                            status: INVITATION_STATUS.REJECTED,
                        }
                    })
                    throw new TRPCError(INVITATION_ERRORS.USER_ALREADY_IN_ORGANIZATION);
                }

                const [membership] = await ctx.prisma.$transaction([
                    ctx.prisma.membership.create({
                        data: {
                            role: invitation.role,
                            userId: ctx.session.user.id,
                            organizationId: invitation.organizationId,
                        }
                    }),
                    ctx.prisma.invitation.update({
                        where: {
                            id: invitation.id,
                        },
                        data: {
                            status: INVITATION_STATUS.ACCEPTED,
                        }
                    })
                ])

                return membership
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(z.object({
            organizationId: z.string(),
            name: z.string(),
            role: z.enum([
                ROLES.ADMIN,
                ROLES.MEMBER,
            ])
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const organization = await ctx.prisma.organization.findFirst({
                    where: {
                        memberships: {
                            some: {
                                organizationId: input.organizationId,
                                userId: ctx.session.user.id,
                            }
                        }
                    },
                    include: {
                        memberships: true,
                    }
                })

                if (!organization) {
                    throw new TRPCError(
                        INVITATION_ERRORS.ORGANIZATION_NOT_FOUND
                    );
                }

                if (!organization.memberships.some(isAdmin)) {
                    throw new TRPCError(
                        INVITATION_ERRORS.USER_CREATE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN
                    );
                }

                const invitation = await ctx.prisma.invitation.create({
                    data: {
                        status: INVITATION_STATUS.PENDING,
                        role: input.role,
                        creatorId: ctx.session.user.id,
                        organizationId: input.organizationId,
                    }
                })

                return invitation
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    delete: protectedProcedure
        .input(z.object({
            id: z.string(),
            organizationId: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const organization = await ctx.prisma.organization.findFirst({
                    where: {
                        memberships: {
                            some: {
                                organizationId: input.organizationId,
                                userId: ctx.session.user.id,
                            }
                        }
                    },
                    include: {
                        memberships: true,
                    }
                })

                if (!organization) {
                    throw new TRPCError(INVITATION_ERRORS.ORGANIZATION_NOT_FOUND);
                }

                if (!organization.memberships.some(isAdmin)) {
                    throw new TRPCError(
                        INVITATION_ERRORS.USER_DELETE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN
                    );
                }

                const invitation = await ctx.prisma.invitation.update({
                    where: {
                        id: input.id,
                    },
                    data: {
                        status: INVITATION_STATUS.REJECTED
                    }
                })

                return invitation
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});