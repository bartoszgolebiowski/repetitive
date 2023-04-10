import { vi } from "vitest";
import { appRouter } from "~/server/api/root";
import { createInnerTRPCContext } from "~/server/api/trpc";
import { prismaMock } from "./prismaMock";

vi.mock("~/server/auth", () => ({
    authOptions: ({}),
    getServerAuthSession: () => ({})
}))

export const sessionUser = {
    user: {
        id: 'userId-1',
    },
    expires: '1'
}

export const sessionNoUser = null

export const callerAuthenticated = appRouter.createCaller(
    createInnerTRPCContext({ session: sessionUser, prisma: prismaMock })
);

export const callerUnauthenticated = appRouter.createCaller(
    createInnerTRPCContext({ session: sessionNoUser, prisma: prismaMock })
);
