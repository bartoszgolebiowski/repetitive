import {
    createTRPCRouter,
    protectedProcedure,
} from "~/server/api/trpc";
import { handleErrorRouter } from "~/utils/httpErrors";
import { markAsReadSchema, getMyNotificationSchema } from "~/utils/schema/action/notification";
import { extractUserEmailOrId } from "~/utils/user";

export const notificationRouter = createTRPCRouter({
    getMy: protectedProcedure
        .input(getMyNotificationSchema)
        .query(async ({ ctx, input }) => {
            try {
                const count = ctx.qb
                    .selectFrom('Notification')
                    .select(ctx.qb.fn.countAll().as('count'))
                    .where('email', '=', extractUserEmailOrId(ctx.auth))
                    .executeTakeFirstOrThrow()

                const notifications = ctx.qb
                    .selectFrom('Notification')
                    .selectAll()
                    .where('email', '=', extractUserEmailOrId(ctx.auth))
                    .orderBy('createdAt', 'desc')
                    .limit(input.pageSize)
                    .offset(input.page * input.pageSize)
                    .execute()

                const [total, data] = await Promise.all([count, notifications])
                return {
                    total: total.count,
                    data,
                };
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
    markAsRead: protectedProcedure
        .input(markAsReadSchema).mutation(async ({ ctx, input }) => {
            try {
                const { id } = input;
                const notification = await ctx.qb.updateTable('Notification')
                    .where('id', '=', id)
                    .set({
                        read: true,
                    })
                    .returning('id')
                    .executeTakeFirstOrThrow()

                return notification;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
