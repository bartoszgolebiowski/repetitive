import { Prisma } from "@prisma/client";
import later from 'later'
import { getNextDay } from "../../utils/date";

const LIMIT = 24 * 7;

const workflowData = Prisma.validator<Prisma.WorkflowArgs>()({
    include: {
        frequency: {
            select: {
                name: true,
                frequencyCrons: true
            }
        },
    },
})

export type WorkflowWithFrequency = Prisma.WorkflowGetPayload<typeof workflowData>

export const generateChecklistItems = (
    startDate: Date,
    endDate: Date,
    workflows: WorkflowWithFrequency[]
) => {
    return workflows.map((workflow) => {
        const crons = workflow.frequency.frequencyCrons;
        return crons.map(({ cron }) => {
            const cronSched = later.parse.cron(cron, true);
            const result = later.schedule(cronSched).next(LIMIT, startDate, endDate);
            if (!result) {
                return [];
            }
            if (Array.isArray(result)) {
                return result.map(createTask(workflow)).flat();
            }
            return [result].map(createTask(workflow)).flat();
        }).flat()
    })
}

const createTask = (workflow: WorkflowWithFrequency) => (
    availableFrom: Date
) => ({
    status: "MISSING" as const,
    createdBy: "SYSTEM",
    updatedBy: "SYSTEM",
    availableFrom: availableFrom,
    availableTo: getNextDay(availableFrom),
    workflowId: workflow.id,
    frequencyId: workflow.frequencyId,
})