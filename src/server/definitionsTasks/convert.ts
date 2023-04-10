import { Prisma } from "@prisma/client";
import { DAYS } from "~/utils/date";

const definitionTasksData = Prisma.validator<Prisma.DefinitionTaskArgs>()({
    include: {
        definition: true,
    }
})

type DefinitionTasksWithDefinition = Prisma.DefinitionTaskGetPayload<typeof definitionTasksData>

export const CHECKLIST_STATUS = {
    DONE: "DONE",
    MISSING: "MISSING",
} as const

const CHECKLIST_CREATOR = 'SYSTEM' as const

export const groupDefinitionTasksByEveryDayAndSortByAvailableFrom =
    (definitionTasks: DefinitionTasksWithDefinition[]) => {
        const groupedByDefinitionName = definitionTasks.reduce((acc, definitionTask) => {
            const definitionName = definitionTask.definition.name;
            if (!acc[definitionName]) {
                acc[definitionName] = [];
            }
            acc[definitionName]?.push(definitionTask);
            return acc;
        }, {} as Record<string, typeof definitionTasks>);

        const groupedByDay = Object.entries(groupedByDefinitionName).reduce(
            (acc, [definitionId, definitionTasks]) => {
                const days = definitionTasks.reduce((acc, definitionTask) => {
                    const day = definitionTask.availableFrom.getDay().toString();
                    if (!acc[day]) {
                        acc[day] = [];
                    }
                    acc[day]?.push(definitionTask);
                    return acc;
                }, {} as Record<string, typeof definitionTasks>);
                acc[definitionId] = days;
                return acc;
            },
            {} as Record<string, Record<string, typeof definitionTasks>>
        );

        const groupedByDayAndSorted = Object.entries(groupedByDay).reduce(
            (acc, [definitionId, days]) => {
                acc[definitionId] = Object.entries(days).reduce(
                    (acc, [day, definitionTasks]) => {
                        acc[day] = definitionTasks.sort(
                            (a, b) =>
                                a.availableFrom.getTime() - b.availableFrom.getTime()
                        );
                        return acc;
                    },
                    {} as Record<string, typeof definitionTasks>
                );
                return acc;
            },
            {} as Record<string, Record<string, typeof definitionTasks>>
        );

        const collectAllTasksForDay = Object.entries(groupedByDayAndSorted).reduce(
            (acc, [definitionId, days]) => {
                acc[definitionId] = Object.keys(DAYS).reduce((acc, day) => {
                    if (!days[day]) {
                        acc[day] = [];
                        return acc;
                    }

                    const definitionTasks = days[day];
                    if (definitionTasks) {
                        acc[day] = definitionTasks
                    }
                    return acc;
                }, {} as Record<string, typeof definitionTasks>);
                return acc;
            },
            {} as Record<string, Record<string, typeof definitionTasks>>
        );

        return collectAllTasksForDay;
    }

export const groupDefinitionTasksByDefinitionIdAndSortedByAvailableFromAndEnabledOnlyFirstTaskOfSameType =
    (definitionTasks: DefinitionTasksWithDefinition[], now = new Date()) => {
        const definitionTasksWithAdditionalInformation = definitionTasks.map((definitionTask) => {
            const isAlreadyUpdated = definitionTask.updatedBy !== CHECKLIST_CREATOR;
            const isStatusMissing = definitionTask.status === CHECKLIST_STATUS.MISSING
            const isStatusDifferentThanMissing = !isStatusMissing;
            const isAvailableFromInTheFuture =
                now.getTime() < definitionTask.availableFrom.getTime();
            const isAvailableToInThePast =
                now.getTime() > definitionTask.availableTo.getTime();

            const disabled =
                isStatusDifferentThanMissing ||
                isAlreadyUpdated ||
                isAvailableFromInTheFuture ||
                isAvailableToInThePast;

            return {
                ...definitionTask,
                derived: {
                    value: isStatusDifferentThanMissing,
                    disabled,
                },
            };
        });

        const groupByDefinitionId = definitionTasksWithAdditionalInformation.reduce((acc, definitionTask) => {
            const definitionName = definitionTask.definition.name;
            if (!acc[definitionName]) {
                acc[definitionName] = [];
            }
            acc[definitionName]?.push(definitionTask);
            return acc;
        }, {} as Record<string, typeof definitionTasksWithAdditionalInformation>);

        const groupByDefinitionIdAndSortedByAvailableFrom = Object.entries(
            groupByDefinitionId
        ).reduce((acc, [definitionId, definitionTasks]) => {
            acc[definitionId] = definitionTasks.sort(
                (a, b) => a.availableFrom.getTime() - b.availableFrom.getTime()
            );
            return acc;
        }, {} as Record<string, typeof definitionTasksWithAdditionalInformation>);

        const enableOnlyFirstTask = Object.entries(
            groupByDefinitionIdAndSortedByAvailableFrom
        ).reduce((acc, [definitionId, definitionTasks]) => {
            let isAlreadyEnabled = false;
            acc[definitionId] = definitionTasks.map((definitionTask) => {
                if (isAlreadyEnabled) {
                    return {
                        ...definitionTask,
                        derived: {
                            ...definitionTask.derived,
                            disabled: true,
                        },
                    }
                }
                if (!definitionTask.derived.value) {
                    isAlreadyEnabled = true;
                    return {
                        ...definitionTask,
                        derived: {
                            ...definitionTask.derived,
                            disabled: false,
                        },
                    }
                }
                return definitionTask

            });
            return acc;
        }, {} as Record<string, typeof definitionTasksWithAdditionalInformation>);

        return Object.values(enableOnlyFirstTask).flat(3);
    }