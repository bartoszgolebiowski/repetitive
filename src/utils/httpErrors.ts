import { TRPCError } from "@trpc/server";

export const handleErrorRouter = (error: unknown) => {
     console.error(error)
    if (error instanceof TRPCError) {
        throw new TRPCError(error);
    }

    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
    });
}