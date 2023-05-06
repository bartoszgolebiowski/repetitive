import { z } from "zod";


/**
 * Schema object for id validation
 * ```ts
 * z.object({
 *  id: z.string()
 * })
 * ```
 */
export const byIdSchema = z.object({
    id: z.string(),
})

/**
 * Schema object for organization validation
 * ```ts
 * z.object({
 *   organizationId: z.string()
 * })
 * ```
 */
export const organizationSchema = z.object({
    organizationId: z.string(),
});

/**
 * Schema object for plant validation  
 * ```ts
 * z.object({
 *   plantId: z.string()
 * })
 * ```
 */
export const plantSchema = z.object({
    plantId: z.string(),
});

/**
 * Schema object for definitionTask validation  
 * ```ts
 * z.object({
 *   definitionTaskId: z.string()
 * })
 * ```
 */
export const definitionTaskSchema = z.object({
    definitionTaskId: z.string(),
});

/**
 * Schema object for organization and plant validation  
 * ```ts
 * z.object({
 *   organizationId: z.string()
 *   plantId: z.string()
 * })
 * ```
 */
export const organizationAndPlantSchema = organizationSchema.merge(plantSchema);