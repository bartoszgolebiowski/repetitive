import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { generateChecklistItems } from "~/server/checklist/generator";
import { getBeginningOfDay, getEndOfDay, compensateDate } from "~/utils/date";
import { handleErrorRouter } from "../../../utils/httpErrors";
import {
    groupDefinitionTasksByEveryDayAndSortByAvailableFrom,
    groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType
} from "../../definitionsTasks/convert";
import { actionItemSchema } from "~/utils/action";
import { CHECKLIST_STATUS } from "~/utils/checklist";

export const definitionTasksRouter = createTRPCRouter({
    generateTestData: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const startDate = new Date('Sat Apr 01 2023 20:34:16 GMT+0200')
            const endDate = new Date('Wed Apr 19 2023 22:29:36 GMT+0200')

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
        .input(z.object({
            workplaceId: z.string(),
            done: z.array(z.string()),
            action: z.array(actionItemSchema)
        }))
        .mutation(async ({ ctx, input }) => {
            try {
                const [statusDone, statusActionRequired, actions] = await ctx.prisma.$transaction([
                    ctx.prisma.definitionTask.updateMany({
                        where: {
                            id: {
                                in: input.done
                            }
                        },
                        data: {
                            updatedBy: ctx.session.user.email ?? ctx.session.user.id,
                            status: CHECKLIST_STATUS.DONE
                        }
                    }),
                    ctx.prisma.definitionTask.updateMany({
                        where: {
                            id: {
                                in: input.action.map(item => item.definitionTaskId)
                            }
                        },
                        data: {
                            updatedBy: ctx.session.user.email ?? ctx.session.user.id,
                            status: CHECKLIST_STATUS.ACTION_REQUIRED
                        }
                    }),
                    ctx.prisma.action.createMany({
                        data: input.action.map(item => ({
                            status: item.status,
                            description: item.description,
                            createdBy: ctx.session.user.email ?? ctx.session.user.id,
                            updatedBy: ctx.session.user.email ?? ctx.session.user.id,
                            assignedTo: item.assignedTo,
                            dueDate: item.dueDate,
                            definitionTaskId: item.definitionTaskId,
                            workplaceId: input.workplaceId
                        }))
                    })]
                )
                return {
                    statusDone,
                    statusActionRequired,
                    actions
                }
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
                            gte: compensateDate(startDay, input.timezoneOffsetStart),
                            lt: compensateDate(endDay, input.timezoneOffsetEnd),
                        },
                        definition: {
                            workplaceId: input.workplaceId,
                        },
                    },
                    include: {
                        definition: true,
                    }
                })

                return groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType(data)
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
                            gte: compensateDate(getBeginningOfDay(startWeek), input.timezoneOffsetStart),
                            lt: compensateDate(getEndOfDay(endWeek), input.timezoneOffsetEnd),
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