import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";

export const actionLine = createTRPCRouter({
    getByPlantId: protectedProcedure
        .input(z.object({ plantId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {


            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(z.object({ plantId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {

            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),

    update: protectedProcedure
        .input(z.object({ plantId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {


            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
