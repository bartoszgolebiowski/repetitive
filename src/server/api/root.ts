import { createTRPCRouter } from "~/server/api/trpc";
import { definitionTasksRouter } from './routers/definitionTasks'
import { frequencyRouter } from "./routers/frequency";
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/users";
import { definitionRouter } from "./routers/definition";
import { plantRouter } from "./routers/plant";
import { invitationRouter } from "./routers/invitation";
import { checklistActionRouter as defectRouter } from "./routers/defect";
import { linePlanRouter } from "./routers/action/linePlan";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  plant: plantRouter,
  definition: definitionRouter,
  definitionTasks: definitionTasksRouter,
  frequency: frequencyRouter,
  user: userRouter,
  invitation: invitationRouter,
  defect: defectRouter,
  linePlan: linePlanRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
