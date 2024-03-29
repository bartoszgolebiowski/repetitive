import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";
import { actionItemEditSchema, actionFilterSchema, actionItemCreateSchema, actionImportSchema, ACTION_STATUS } from "~/utils/schema/action/action";
import { extractUserEmailOrId } from "~/utils/user";

export const actionRouter = createTRPCRouter({
    getByFilters: protectedProcedure
        .input(actionFilterSchema)
        .query(async ({ ctx, input }) => {
            const { actionPlanId, leader, priority, startDate, dueDate, assignedTo, status } = input.filters;
            try {
                let query = ctx.qb
                    .selectFrom('Action')
                    .selectAll()
                    .where('actionPlanId', '=', actionPlanId)

                if (priority) {
                    query = query.where('priority', 'in', priority)
                }
                if (status) {
                    query = query.where('status', 'in', status)
                }
                if (startDate) {
                    query = query.where('startDate', '<=', startDate)
                }
                if (dueDate) {
                    query = query.where('dueDate', '<=', dueDate)
                }
                if (assignedTo) {
                    query = query.where('assignedTo', '=', assignedTo)
                }
                if (leader) {
                    query = query.where('leader', '=', leader)
                }

                const actions = await query.execute()
                const comments = await ctx.qb
                    .selectFrom('Comment')
                    .selectAll()
                    .where('actionId', 'in', actions.map((action) => action.id))
                    .execute()

                return actions.map((action) => ({
                    ...action,
                    comments: comments.filter((comment) => comment.actionId === action.id),
                }))
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    create: protectedProcedure
        .input(actionItemCreateSchema)
        .mutation(async ({ ctx, input }) => {
            const { comment, ...rest } = input;
            try {
                const createdAction = await ctx.qb.transaction().execute(async (trx) => {
                    const actionDB = await trx
                        .insertInto("Action")
                        .values({
                            ...rest,
                            updatedAt: new Date(),
                            createdAt: new Date(),
                            createdBy: extractUserEmailOrId(ctx.auth),
                            updatedBy: extractUserEmailOrId(ctx.auth),
                            status: ACTION_STATUS.IN_PROGRESS
                        })
                        .returningAll()
                        .executeTakeFirstOrThrow();

                    const commentDB = await trx
                        .insertInto("Comment")
                        .values({
                            comment: input.comment,
                            createdBy: extractUserEmailOrId(ctx.auth),
                            actionId: actionDB.id,
                        })
                        .returningAll()
                        .executeTakeFirstOrThrow();

                    return {
                        ...actionDB,
                        comments: commentDB,
                    };
                })

                ctx.bus.emit('action:created', { id: createdAction.id, actionPlanId: input.actionPlanId });
                // todo switch to cron 
                ctx.bus.emit('action:syncStatuses', { expiryDate: new Date() });
                return createdAction;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    update: protectedProcedure
        .input(actionItemEditSchema)
        .mutation(async ({ ctx, input }) => {
            const { comment, ...rest } = input;

            try {
                const action = await ctx.qb.transaction().execute(async (trx) => {
                    const actionDB = await trx
                        .updateTable("Action")
                        .set({
                            ...rest,
                            updatedAt: new Date(),
                            createdAt: new Date(),
                            createdBy: extractUserEmailOrId(ctx.auth),
                            updatedBy: extractUserEmailOrId(ctx.auth),
                        })
                        .where('id', '=', input.id)
                        .returning('id')
                        .executeTakeFirstOrThrow();

                    if (input.comment) {
                        await trx
                            .insertInto("Comment")
                            .values({
                                comment: input.comment,
                                createdBy: extractUserEmailOrId(ctx.auth),
                                actionId: actionDB.id,
                            })
                            .executeTakeFirstOrThrow();
                    }

                    const updatedAction = await trx
                        .selectFrom("Action")
                        .where('id', '=', actionDB.id)
                        .select('actionPlanId')
                        .executeTakeFirstOrThrow();

                    return updatedAction
                })

                ctx.bus.emit('action:updated', { id: input.id, actionPlanId: action.actionPlanId });
                // todo switch to cron 
                ctx.bus.emit('action:syncStatuses', { expiryDate: new Date() });
                return action;
            }
            catch (error) {
                console.log(error)
                handleErrorRouter(error)
            }
        }),
    import: protectedProcedure
        .input(actionImportSchema)
        .mutation(async ({ ctx, input }) => {
            try {
                const actions = await ctx.qb
                    .insertInto("Action")
                    .values(input.map((item) => ({
                        ...item,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: extractUserEmailOrId(ctx.auth),
                        updatedBy: extractUserEmailOrId(ctx.auth),
                        status: ACTION_STATUS.IN_PROGRESS,
                    })))
                    .returning('id')
                    .execute()
                ctx.bus.emit('action:syncStatuses', { expiryDate: new Date() })
                return actions;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        })
});