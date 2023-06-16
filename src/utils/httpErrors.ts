import { TRPCError } from "@trpc/server";
import { log } from "next-axiom";

export const handleErrorRouter = (error: unknown) => {
    log.error(
        'Error in router', {
        error,
    })
    
    if (error instanceof TRPCError) {
        throw new TRPCError(error);
    }

    throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred, please try again later.',
    });
}