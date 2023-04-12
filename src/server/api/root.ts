import { createTRPCRouter } from "~/server/api/trpc";
import { definitionTasksRouter } from './routers/definitionTasks'
import { frequencyRouter } from "./routers/frequency";
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/users";
import { definitionRouter } from "./routers/definition";
import { workplaceRouter } from "./routers/workplace";
import { invitationRouter } from "./routers/invitation";
import { actionRouter } from "./routers/action";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  workplace: workplaceRouter,
  definition: definitionRouter,
  definitionTasks: definitionTasksRouter,
  frequency: frequencyRouter,
  user: userRouter,
  invitation: invitationRouter,
  action: actionRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
