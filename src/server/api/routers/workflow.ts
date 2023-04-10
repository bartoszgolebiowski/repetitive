import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "./utils";

export const workflowRouter = createTRPCRouter({
    getByWorkplaceId: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const workflows = await ctx.prisma.workflow.findMany({
                    where: {
                        workplaceId: input.workplaceId,
                    },
                    include: {
                        workplace: true,
                        frequency: true,
                    }
                });

                return workflows
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
                const workflow = await ctx.prisma.workflow.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        frequencyId: input.frequencyId,
                        workplaceId: input.workplaceId,
                    },
                })

                return workflow
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
