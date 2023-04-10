import { Prisma } from "@prisma/client";
import later from 'later'
import { getNextDay } from "../../utils/date";

const LIMIT = 24 * 7;

const definitionData = Prisma.validator<Prisma.DefinitionArgs>()({
    include: {
        frequency: {
            select: {
                name: true,
                frequencyCrons: true
            }
        },
    },
})

export type DefinitionWithFrequency = Prisma.DefinitionGetPayload<typeof definitionData>

export const generateChecklistItems = (
    startDate: Date,
    endDate: Date,
    definitions: DefinitionWithFrequency[]
) => {
    return definitions.map((definition) => {
        const crons = definition.frequency.frequencyCrons;
        return crons.map(({ cron }) => {
            const cronSched = later.parse.cron(cron, true);
            const result = later.schedule(cronSched).next(LIMIT, startDate, endDate);
            if (!result) {
                return [];
            }
            if (Array.isArray(result)) {
                return result.map(createTask(definition)).flat();
            }
            return [result].map(createTask(definition)).flat();
        }).flat()
    })
}

const createTask = (definition: DefinitionWithFrequency) => (
    availableFrom: Date
) => ({
    status: "MISSING" as const,
    createdBy: "SYSTEM",
    updatedBy: "SYSTEM",
    availableFrom: availableFrom,
    availableTo: getNextDay(availableFrom),
    definitionId: definition.id,
    frequencyId: definition.frequencyId,
})