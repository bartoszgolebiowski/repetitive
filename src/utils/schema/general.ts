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
 * Schema object for linePlan validation  
 * ```ts
 * z.object({
 *   linePlanId: z.string()
 * })
 * ```
 */
export const linePlanSchema = z.object({
    linePlanId: z.string(),
});

