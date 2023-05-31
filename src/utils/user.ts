import { type SignedInAuthObject } from "@clerk/nextjs/dist/types/server"

export const ORGANIZATION_MEMBERSHIP_LIMIT = 3;

export const extractUserId = (auth: SignedInAuthObject) => {
    return auth.userId
}