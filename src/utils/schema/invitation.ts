import { z } from "zod";
import { ROLES } from "~/server/api/roles";
import { organizationSchema } from "./general";

export const INVITATION_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    REJECTED: 'REJECTED',
} as const;

export const deleteSchema = z.object({
    id: z.string(),
    organizationId: z.string()
});

export const createSchema = organizationSchema.merge(z.object({
    name: z.string(),
    role: z.enum([
        ROLES.ADMIN,
        ROLES.MEMBER,
    ])
}));

export const acceptSchema = z.object({ id: z.string(), organizationId: z.string(), });