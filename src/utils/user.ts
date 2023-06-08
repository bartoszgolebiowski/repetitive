import { type SignedInAuthObject } from "@clerk/nextjs/dist/types/server"

export const ORGANIZATION_MEMBERSHIP_LIMIT = 3;

export const extractUserEmailOrId = (auth: SignedInAuthObject) => {
    const email = auth.sessionClaims.email;
    if (email) {
        return email as string;
    }

    return auth.userId
}