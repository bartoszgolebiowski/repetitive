import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { CronQuartz } from "~/server/frequency/cronValidation";
import { handleErrorRouter } from "./utils";

export const frequencyRouter = createTRPCRouter({
    getByWorkplaceId: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .query(async ({ ctx, input }) => {
            try {
                const frequencies = await ctx.prisma.frequency.findMany({
                    where: {
                        workplaceId: input.workplaceId
                    },
                    include: {
                        frequencyCrons: true
                    }
                })

                return frequencies
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            cron: z.array(z.string()).refine(
                crons => crons.every(singleCron => new CronQuartz().test(singleCron)),
                crons => ({
                    message: `Invalid cron expressions: ${crons.filter(
                        singleCron => !new CronQuartz().test(singleCron)
                    ).join(', ')}`
                })
            ),
            description: z.string().optional(),
            workplaceId: z.string(),
        }))
        .mutation(async ({ input, ctx }) => {
            try {
                const frequency = await ctx.prisma.frequency.create({
                    data: {
                        name: input.name,
                        frequencyCrons: {
                            create: input.cron.map(cron => ({ cron }))
                        },
                        description: input.description,
                        workplace: {
                            connect: {
                                id: input.workplaceId
                            }
                        }
                    }
                })

                return frequency
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
