import { createTRPCRouter } from "~/server/api/trpc";
import { linePlanRouter } from "./routers/linePlan";
import { actionPlanRouter } from "./routers/actionPlan";
import { actionRouter } from "./routers/action";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  linePlan: linePlanRouter,
  actionPlan: actionPlanRouter,
  action: actionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
