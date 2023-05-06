import { z } from "zod";
import { plantSchema } from "./general";

export const createSchema = plantSchema.merge(z.object({
    name: z.string(),
    frequencyId: z.string(),
    description: z.string()
}))