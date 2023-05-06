import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { plantSchema } from "~/utils/schema/general";
import { createSchema } from "~/utils/schema/frequency";

export const frequencyRouter = createTRPCRouter({
    getByPlantId: protectedProcedure
        .input(plantSchema)
        .query(async ({ ctx, input }) => {
            try {
                const frequencies = await ctx.prisma.frequency.findMany({
                    where: {
                        plantId: input.plantId
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
        .input(createSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const frequency = await ctx.prisma.frequency.create({
                    data: {
                        name: input.name,
                        frequencyCrons: {
                            create: input.cron.map(cron => ({ cron }))
                        },
                        description: input.description,
                        plant: {
                            connect: {
                                id: input.plantId
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
