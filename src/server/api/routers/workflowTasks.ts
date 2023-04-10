import { z } from "zod";

import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { generateChecklistItems } from "~/server/checklist/generator";
import { getBeginningOfDay, getEndOfDay, compensateDate, DAYS } from "~/utils/date";
import { handleErrorRouter } from "./utils";

const CHECKLIST_STATUS = {
    DONE: "DONE",
    MISSING: "MISSING",
} as const

const CHECKLIST_CREATOR = 'SYSTEM' as const

export const workflowTasksRouter = createTRPCRouter({
    generateTestData: protectedProcedure
        .input(z.object({ workplaceId: z.string() }))
        .mutation(async ({ ctx, input }) => {
            const startDate = new Date('Sat Apr 01 2023 20:34:16 GMT+0200')
            const endDate = new Date('Sun Apr 09 2023 20:34:16 GMT+0200')

            try {
                const workplace = await ctx.prisma.workflow.findMany({
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

                const workflowTasks = generateChecklistItems(startDate, endDate, workplace).flat()

                await ctx.prisma.workflowTask.createMany({
                    data: workflowTasks
                })
            } catch (error) {
                handleErrorRouter(error)
            }
        }),
    submit: protectedProcedure
        .input(z.array(z.string()))
        .mutation(async ({ ctx, input }) => {
            try {
                await ctx.prisma.workflowTask.updateMany({
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
                const workplace = await ctx.prisma.workflow.findMany({
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

                const workflowTasks = generateChecklistItems(input.startDate, input.endDate, workplace)

                await ctx.prisma.workflowTask.createMany({
                    data: workflowTasks
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
                const data = await ctx.prisma.workflowTask.findMany({
                    where: {
                        availableFrom: {
                            gte: compensateDate(startDay, input.timezoneOffsetStart),
                            lte: compensateDate(endDay, input.timezoneOffsetEnd),
                        },
                        workflow: {
                            workplaceId: input.workplaceId
                        },
                    },
                    include: {
                        workflow: true,
                    }
                })

                const workflowTasks = data.map((workflowTask) => {
                    const now = new Date();
                    const isAlreadyUpdated = workflowTask.updatedBy !== CHECKLIST_CREATOR;
                    const isStatusMissing = workflowTask.status === CHECKLIST_STATUS.MISSING
                    const isStatusDifferentThanMissing = !isStatusMissing;
                    const isAvailableFromInTheFuture =
                        now.getTime() < workflowTask.availableFrom.getTime();
                    const isAvailableToInThePast =
                        now.getTime() > workflowTask.availableTo.getTime();

                    const disabled =
                        isStatusDifferentThanMissing ||
                        isAlreadyUpdated ||
                        isAvailableFromInTheFuture ||
                        isAvailableToInThePast;


                    return {
                        ...workflowTask,
                        derived: {
                            value: isStatusDifferentThanMissing,
                            disabled,
                        },
                    };
                });

                const groupByWorkflowId = workflowTasks?.reduce((acc, workflowTask) => {
                    const workflowId = workflowTask.workflow.name;
                    if (!acc[workflowId]) {
                        acc[workflowId] = [];
                    }
                    acc[workflowId]?.push(workflowTask);
                    return acc;
                }, {} as Record<string, typeof workflowTasks>);

                const groupByWorkflowIdAndSortedByAvailableFrom = Object.entries(
                    groupByWorkflowId || {}
                ).reduce((acc, [workflowId, workflowTasks]) => {
                    acc[workflowId] = workflowTasks.sort(
                        (a, b) => a.availableFrom.getTime() - b.availableFrom.getTime()
                    );
                    return acc;
                }, {} as Record<string, typeof workflowTasks>);

                const enableOnlyFirstTask = Object.entries(
                    groupByWorkflowIdAndSortedByAvailableFrom || {}
                ).reduce((acc, [workflowId, workflowTasks]) => {
                    let isAlreadyEnabled = false;
                    acc[workflowId] = workflowTasks.map((workflowTask) => {
                        if (isAlreadyEnabled) {
                            return {
                                ...workflowTask,
                                derived: {
                                    ...workflowTask.derived,
                                    disabled: true,
                                },
                            }
                        }
                        if (!workflowTask.derived.value) {
                            isAlreadyEnabled = true;
                            return {
                                ...workflowTask,
                                derived: {
                                    ...workflowTask.derived,
                                    disabled: false,
                                },
                            }
                        }
                        return workflowTask

                    });
                    return acc;
                }, {} as Record<string, typeof workflowTasks>);

                return Object.values(enableOnlyFirstTask).flat(3);
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
                const data = await ctx.prisma.workflowTask.findMany({
                    where: {
                        availableFrom: {
                            gte: compensateDate(getBeginningOfDay(startWeek), input.timezoneOffsetStart),
                            lte: compensateDate(getEndOfDay(endWeek), input.timezoneOffsetEnd),
                        },
                        workflow: {
                            workplaceId: input.workplaceId
                        },
                    },
                    include: {
                        workflow: true,
                    }
                })

                const tasks = data.reduce((acc, workflowTask) => {
                    const workflowId = workflowTask.workflow.name;
                    if (!acc[workflowId]) {
                        acc[workflowId] = [];
                    }
                    acc[workflowId]?.push(workflowTask);
                    return acc;
                }, {} as Record<string, typeof data>);

                const groupedByDays = Object.entries(tasks).reduce(
                    (acc, [workflowId, workflowTasks]) => {
                        const days = workflowTasks.reduce((acc, workflowTask) => {
                            const day = workflowTask.availableFrom.getDay().toString();
                            if (!acc[day]) {
                                acc[day] = [];
                            }
                            acc[day]?.push(workflowTask);
                            return acc;
                        }, {} as Record<string, typeof workflowTasks>);
                        acc[workflowId] = days;
                        return acc;
                    },
                    {} as Record<string, Record<string, typeof data>>
                );

                const groupedByDaysAndSorted = Object.entries(groupedByDays).reduce(
                    (acc, [workflowId, days]) => {
                        acc[workflowId] = Object.entries(days).reduce(
                            (acc, [day, workflowTasks]) => {
                                acc[day] = workflowTasks.sort(
                                    (a, b) =>
                                        a.availableFrom.getTime() - b.availableFrom.getTime()
                                );
                                return acc;
                            },
                            {} as Record<string, typeof data>
                        );
                        return acc;
                    },
                    {} as Record<string, Record<string, typeof data>>
                );

                return Object.entries(groupedByDaysAndSorted).reduce(
                    (acc, [workflowId, days]) => {
                        acc[workflowId] = Object.keys(DAYS).reduce((acc, day) => {
                            if (!days[day]) {
                                acc[day] = [];
                                return acc;
                            }

                            const workflowTasks = days[day];
                            if (workflowTasks) {
                                acc[day] = workflowTasks
                            }
                            return acc;
                        }, {} as Record<string, typeof data>);
                        return acc;
                    },
                    {} as Record<string, Record<string, typeof data>>
                );

            } catch (error) {
                handleErrorRouter(error)
            }
        }),
});