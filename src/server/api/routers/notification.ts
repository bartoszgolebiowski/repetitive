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
                const where = {
                    email: extractUserEmailOrId(ctx.auth),
                }

                const count = ctx.prisma.notification.count({
                    where,
                })

                const notification = ctx.prisma.notification.findMany({
                    where,
                    select: {
                        id: true,
                        createdAt: true,
                        cause: true,
                        title: true,
                        message: true,
                        read: true,
                        variables: true,
                    },
                    take: input.pageSize,
                    skip: input.page * input.pageSize,
                    orderBy: {
                        createdAt: "desc",
                    }
                })
                const [total, data] = await Promise.all([count, notification])
                return {
                    total,
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
                const notification = await ctx.prisma.notification.update({
                    where: {
                        id,
                    },
                    data: {
                        read: true,
                    },
                    select: {
                        id: true,
                    }
                })
                return notification;
            }
            catch (error) {
                handleErrorRouter(error)
            }
        }),
});
