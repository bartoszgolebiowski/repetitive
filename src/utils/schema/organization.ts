import { z } from "zod";
import { organizationSchema } from "./general";

export const createSchema = organizationSchema.merge(z.object({
    name: z.string(),
}))