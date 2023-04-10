import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { generateChecklistItems } from "~/server/checklist/generator";
import { getBeginningOfDay, getEndOfDay, compensateDate } from "~/utils/date";
import { handleErrorRouter } from "../../../utils/httpErrors";
import {
    CHECKLIST_STATUS,
    groupDefinitionTasksByEveryDayAndSortByAvailableFrom,
    groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType
} from "../../definitionsTasks/convert";

export const definitionTasksRouter = createTRPCRouter({
    generateTestData: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const startDate = new Date('Sat Apr 01 2023 20:34:16 GMT+0200')
            const endDate = new Date('Mon Apr 10 2023 21:20:42 GMT+0200')

            try {
                const workplace = await ctx.prisma.definition.findMany({
                    where: {
                        workplaceId: input.workplaceId,
                    },
                    include: {
                        frequency: {
                            select: {
                                name: true,
                                frequencyCrons: true
                            }
                        },
                    },
                });

                const definitionTasks = generateChecklistItems(startDate, endDate, workplace).flat()

                await ctx.prisma.definitionTask.createMany({
                    data: definitionTasks
                })
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    submit: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.definitionTask.updateMany({
                    where: {
                        id: {
                            in: input
                        }
                    },
                    data: {
                        updatedBy: ctx.session.user.id,
                        status: CHECKLIST_STATUS.DONE
                    }
                })
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    generateForWorkplaceId: protectedProcedure
        .input(z.object({ workplaceId: z.string(), startDate: z.date(), endDate: z.date() }))
        .mutation(async ({ ctx, input }) => {
            try {
                const workplace = await ctx.prisma.definition.findMany({
                    where: {
                        workplaceId: input.workplaceId,
                    },
                    include: {
                        frequency: {
                            select: {
                                name: true,
                                frequencyCrons: true
                            }
                        },
                    },
                });

                const definitionTasks = generateChecklistItems(input.startDate, input.endDate, workplace).flat()

                await ctx.prisma.definitionTask.createMany({
                    data: definitionTasks
                })
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    getByWorkplaceId: protectedProcedure
        .input(z.object({
            workplaceId: z.string(),
            startDay: z.date(),
            endDay: z.date(),
            timezoneOffsetStart: z.number(),
            timezoneOffsetEnd: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const [startDay, endDay] = [input.startDay, input.endDay]

            try {
                const data = await ctx.prisma.definitionTask.findMany({
                    where: {
                        availableFrom: {
                            gt: compensateDate(startDay, input.timezoneOffsetStart),
                            lte: compensateDate(endDay, input.timezoneOffsetEnd),
                        },
                        definition: {
                            workplaceId: input.workplaceId
                        },
                    },
                    include: {
                        definition: true,
                    }
                })

                return groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType(data);
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    getHistoryByWorkplaceId: protectedProcedure
        .input(z.object({
            workplaceId: z.string(),
            startDay: z.date(),
            endDay: z.date(),
            timezoneOffsetStart: z.number(),
            timezoneOffsetEnd: z.number()
        }))
        .query(async ({ ctx, input }) => {
            const [startWeek, endWeek] = [input.startDay, input.endDay]

            try {
                const data = await ctx.prisma.definitionTask.findMany({
                    where: {
                        availableFrom: {
                            gt: compensateDate(getBeginningOfDay(startWeek), input.timezoneOffsetStart),
                            lte: compensateDate(getEndOfDay(endWeek), input.timezoneOffsetEnd),
                        },
                        definition: {
                            workplaceId: input.workplaceId
                        },
                    },
                    include: {
                        definition: true,
                    }
                })

                return groupDefinitionTasksByEveryDayAndSortByAvailableFrom(data);
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
});