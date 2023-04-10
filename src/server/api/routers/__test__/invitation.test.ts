/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { ZodError } from 'zod';
import { describe, it, expect } from 'vitest';
import { TRPCError } from '@trpc/server';
import { callerAuthenticated, callerUnauthenticated } from './trpcCaller';
import { prismaMock } from './prismaMock';
import { INVITATION_ERRORS, INVITATION_STATUS } from '../invitation';

describe('invitation', () => {
    describe('create', () => {
        it('should throw an excpetion when user is not logged in', () => {
            expect(
                callerUnauthenticated.invitation.create({
                    name: 'test',
                    organizationId: 'organizationId-1',
                    role: "ADMIN"
                })
            ).rejects.toThrow(
                new TRPCError({ code: "UNAUTHORIZED" })
            )
        })

        it('should throw an excpetion when input is not valid', () => {
            expect(
                // @ts-expect-error wrong input value 
                callerAuthenticated.invitation.create({})
            ).rejects.toThrow(
                new ZodError([
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["organizationId"],
                        message: "Required"
                    },
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["name"],
                        message: "Required"
                    },
                    {
                        //@ts-expect-error zod type is not correct
                        expected: "'ADMIN' | 'MEMBER'",
                        received: "undefined",
                        code: "invalid_type",
                        path: ["role"],
                        message: "Required"
                    }])
            )
        })

        it('should throw an excpetion when role is not valid', () => {
            expect(
                callerAuthenticated.invitation.create({
                    name: 'test',
                    organizationId: 'organizationId-1',
                    // @ts-expect-error wrong input value for role
                    role: ""
                })
            ).rejects.toThrow(
                new ZodError([{
                    received: "",
                    code: "invalid_enum_value",
                    options: ["ADMIN", "MEMBER"],
                    path: ["role"],
                    message: "Invalid enum value. Expected 'ADMIN' | 'MEMBER', received ''"
                }])
            )
        })

        it('should throw an excpetion when organization does not exist', () => {
            prismaMock.organization.findFirst.mockResolvedValueOnce(null)
            expect(
                callerAuthenticated.invitation.create({
                    name: 'test',
                    organizationId: 'organizationId-1',
                    role: "ADMIN"
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.ORGANIZATION_NOT_FOUND)
            )
        })

        it('should throw an excpetion when user is not admin', () => {
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
                //@ts-expect-error deep mock is not working correctly with prisma types
                memberships: [{
                    id: 'membershipId-1',
                    role: 'MEMBER',
                    userId: 'userId-1',
                    organizationId: 'organizationId-1',
                }]
            })

            expect(
                callerAuthenticated.invitation.create({
                    name: 'test',
                    organizationId: 'organizationId-1',
                    role: "ADMIN"
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.USER_CREATE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN)
            )
        })

        it('should create an invitation', () => {
            const input = {
                name: 'test',
                organizationId: 'organizationId-1',
                role: "ADMIN"
            } as const;

            const output = {
                id: 'invitationId-1',
                creatorId: 'userId-1',
                status: 'PENDING',
                userId: null,
                organizationId: input.organizationId,
                role: input.role,
            } as const;

            prismaMock.invitation.create.mockResolvedValueOnce(output)
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
                //@ts-expect-error deep mock is not working correctly with prisma types
                memberships: [{
                    id: 'membershipId-1',
                    role: 'ADMIN',
                    userId: 'userId-1',
                    organizationId: 'organizationId-1',
                }]
            })

            expect(
                callerAuthenticated.invitation.create(input)
            ).resolves.toEqual(output)

        })
    })

    describe('delete', () => {
        it('should throw an excpetion when user is not logged in', () => {
            expect(
                callerUnauthenticated.invitation.delete({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError({ code: "UNAUTHORIZED" })
            )
        })

        it('should throw an excpetion when input is not valid', () => {
            expect(
                // @ts-expect-error wrong input value for organizationId and id
                callerAuthenticated.invitation.delete({})
            ).rejects.toThrow(
                new ZodError([
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["id"],
                        message: "Required"
                    },
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["organizationId"],
                        message: "Required"
                    }
                ])
            )
        })

        it('should throw an excpetion when organization does not exist', () => {
            prismaMock.organization.findFirst.mockResolvedValueOnce(null)
            expect(
                callerAuthenticated.invitation.delete({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.ORGANIZATION_NOT_FOUND)
            )
        })

        it('should throw an excpetion when user is not admin', () => {
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
                //@ts-expect-error deep mock is not working correctly with prisma types
                memberships: [{
                    id: 'membershipId-1',
                    role: 'MEMBER',
                    userId: 'userId-1',
                    organizationId: 'organizationId-1',
                }]
            })

            expect(
                callerAuthenticated.invitation.delete({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.USER_DELETE_INVITATION_FOR_ORGANIZATION_WITHOUT_ADMIN)
            )
        })

        it('should delete an invitation', () => {
            const input = {
                id: 'invitationId-1',
                organizationId: 'organizationId-1',
            } as const;
            const output = {
                id: input.id,
                status: INVITATION_STATUS.REJECTED,
                creatorId: 'userId-1',
                organizationId: input.organizationId,
                userId: null,
                role: 'MEMBER',
            } as const;

            prismaMock.invitation.update.mockResolvedValueOnce(output)
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
                //@ts-expect-error deep mock is not working correctly with prisma types
                memberships: [{
                    id: 'membershipId-1',
                    role: 'ADMIN',
                    userId: 'userId-1',
                    organizationId: 'organizationId-1',
                }]
            })

            expect(
                callerAuthenticated.invitation.delete(input)
            ).resolves.toEqual(output)
        })
    })

    describe('accept', () => {
        it('should throw an excpetion when user is not logged in', () => {
            expect(
                callerUnauthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError({ code: "UNAUTHORIZED" })
            )
        })

        it('should throw an excpetion when input is not valid', () => {
            expect(
                // @ts-expect-error wrong input value for organizationId and id
                callerAuthenticated.invitation.accept({})
            ).rejects.toThrow(
                new ZodError([
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["id"],
                        message: "Required"
                    },
                    {
                        code: "invalid_type",
                        expected: "string",
                        received: "undefined",
                        path: ["organizationId"],
                        message: "Required"
                    }
                ])
            )
        })

        it('should throw an excpetion when invitation does not exist', () => {
            prismaMock.invitation.findFirst.mockResolvedValueOnce(null)
            prismaMock.organization.findFirst.mockResolvedValueOnce(null)
            prismaMock.membership.findFirst.mockResolvedValueOnce(null)
            expect(
                callerAuthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.INVITATION_NOT_FOUND)
            )
        })

        it('should throw an excpetion when organization does not exist', () => {
            prismaMock.invitation.findFirst.mockResolvedValueOnce({
                id: 'invitationId-1',
                status: INVITATION_STATUS.ACCEPTED,
                creatorId: 'userId-1',
                organizationId: 'organizationId-1',
                userId: null,
                role: 'MEMBER',
            })
            prismaMock.organization.findFirst.mockResolvedValueOnce(null)
            prismaMock.membership.findFirst.mockResolvedValueOnce(null)
            expect(
                callerAuthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.ORGANIZATION_NOT_FOUND)
            )
        })

        it('should throw an excpetion when invitation is in different status than PENDING', () => {
            prismaMock.invitation.findFirst.mockResolvedValueOnce({
                id: 'invitationId-1',
                status: INVITATION_STATUS.ACCEPTED,
                creatorId: 'userId-1',
                organizationId: 'organizationId-1',
                userId: null,
                role: 'MEMBER',
            })
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
            })
            prismaMock.membership.findFirst.mockResolvedValueOnce(null)
            expect(
                callerAuthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.INVINTATION_WRONG_STATUS)
            )
        })

        it('should throw an excpetion when user is already in organization', () => {
            prismaMock.invitation.findFirst.mockResolvedValueOnce({
                id: 'invitationId-1',
                status: INVITATION_STATUS.PENDING,
                creatorId: 'userId-1',
                organizationId: 'organizationId-1',
                userId: null,
                role: 'MEMBER',
            })
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
            })
            prismaMock.membership.findFirst.mockResolvedValueOnce({
                id: 'membershipId-1',
                role: 'MEMBER',
                userId: 'userId-1',
                organizationId: 'organizationId-1',
            })
            expect(
                callerAuthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).rejects.toThrow(
                new TRPCError(INVITATION_ERRORS.USER_ALREADY_IN_ORGANIZATION)
            )
        })

        it('should return new membership', () => {
            const output = {
                id: 'membershipId-1',
                role: 'MEMBER',
                userId: 'userId-1',
                organizationId: 'organizationId-1',
            }
            prismaMock.invitation.findFirst.mockResolvedValueOnce({
                id: 'invitationId-1',
                status: INVITATION_STATUS.PENDING,
                creatorId: 'userId-1',
                organizationId: 'organizationId-1',
                userId: null,
                role: 'MEMBER',
            })
            prismaMock.organization.findFirst.mockResolvedValueOnce({
                id: 'organizationId-1',
                name: 'test',
            })
            prismaMock.membership.findFirst.mockResolvedValueOnce(null)
            prismaMock.$transaction.mockResolvedValueOnce([
                output
            ])
            expect(
                callerAuthenticated.invitation.accept({
                    id: 'invitationId-1',
                    organizationId: 'organizationId-1',
                })
            ).resolves.toEqual(output)
        })
    })
})