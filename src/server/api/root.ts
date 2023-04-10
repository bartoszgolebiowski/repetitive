import { createTRPCRouter } from "~/server/api/trpc";
import { workflowTasksRouter } from './routers/workflowTasks'
import { frequencyRouter } from "./routers/frequency";
import { organizationRouter } from "./routers/organization";
import { userRouter } from "./routers/users";
import { workflowRouter } from "./routers/workflow";
import { workplaceRouter } from "./routers/workplace";
import { invitationRouter } from "./routers/invitation";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  workplace: workplaceRouter,
  workflow: workflowRouter,
  workflowTasks: workflowTasksRouter,
  frequency: frequencyRouter,
  user: userRouter,
  invitation: invitationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
