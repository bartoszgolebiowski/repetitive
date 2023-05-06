import { z } from "zod";
import { CronQuartz } from "~/server/frequency/cronValidation";
import { plantSchema } from "./general";

export const createSchema = plantSchema.merge(z.object({
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
}))
