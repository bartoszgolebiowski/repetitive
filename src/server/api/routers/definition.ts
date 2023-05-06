import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "../../../utils/httpErrors";
import { plantSchema } from "~/utils/schema/general";
import { createSchema } from "~/utils/schema/definition";

export const definitionRouter = createTRPCRouter({
    getByPlantId: protectedProcedure
        .input(plantSchema)
        .query(async ({ ctx, input }) => {
            try {
                const definitions = await ctx.prisma.definition.findMany({
                    where: {
                        plantId: input.plantId,
                    },
                    include: {
                        plant: true,
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
        .input(createSchema)
        .mutation(async ({ input, ctx }) => {
            try {
                const definitions = await ctx.prisma.definition.create({
                    data: {
                        name: input.name,
                        description: input.description,
                        frequencyId: input.frequencyId,
                        plantId: input.plantId,
                    },
                })

                return definitions
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
