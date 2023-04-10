import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";

export const definitionRouter = createTRPCRouter({
    getByWorkplaceId: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const definitions = await ctx.prisma.definition.findMany({
                    where: {
                        workplaceId: input.workplaceId,
                    },
                    include: {
                        workplace: true,
                        frequency: true,
                    }
                });

                return definitions
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            workplaceId: z.string(),
            frequencyId: z.string(),
            description: z.string()
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const definitions = await ctx.prisma.definition.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        frequencyId: input.frequencyId,
                        workplaceId: input.workplaceId,
                    },
                })

                return definitions
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
