/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */

/**
 * @vitest-environment node
 */

import { mockDeep } from 'vitest-mock-extended';
import { describe, it, expect, beforeEach, vitest } from 'vitest'
import { createHandlersNotification } from '../handler/notification';
import { type IBus } from '../bus';
import { NOTIFICATION_CAUSE } from '~/utils/schema/action/notification';

describe('nitifaction event handler', () => {
    const bus: IBus = mockDeep<IBus>()
    const notificationRepository = mockDeep<Parameters<typeof createHandlersNotification>[0]>()
    const actionRepository = mockDeep<Parameters<typeof createHandlersNotification>[1]>()

    beforeEach(() => {
        vitest.resetAllMocks()
    })

    const eventHandler = createHandlersNotification(
        notificationRepository,
        actionRepository,
    )(bus)

    describe('notification:actionUpdated', () => {
        it('should create two notifications when leader and assigned to are different', async () => {
            actionRepository.getById.mockResolvedValueOnce({
                id: 'actionId',
                leader: 'leaderId',
                assignedTo: 'assignedToId',
            })

            const result = await eventHandler['notification:actionUpdated']({ id: 'actionId' })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'assignedToId' },
                    { id: 'actionId', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_UPDATE
            })
        })

        it('should create one notification when leader and assigned to are equal', async () => {
            actionRepository.getById.mockResolvedValueOnce({
                id: 'actionId',
                leader: 'leaderId',
                assignedTo: 'leaderId',
            })

            const result = await eventHandler['notification:actionUpdated']({ id: 'actionId' })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_UPDATE
            })
        })
    })

    describe('notification:actionCreated', () => {
        it('should create two notifications when leader and assigned to are different', async () => {
            actionRepository.getById.mockResolvedValueOnce({
                id: 'actionId',
                leader: 'leaderId',
                assignedTo: 'assignedToId',
            })

            const result = await eventHandler['notification:actionCreated']({ id: 'actionId' })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'assignedToId' },
                    { id: 'actionId', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_CREATED
            })
        })

        it('should create one notification when leader and assigned to are equal', async () => {
            actionRepository.getById.mockResolvedValueOnce({
                id: 'actionId',
                leader: 'leaderId',
                assignedTo: 'leaderId',
            })

            const result = await eventHandler['notification:actionCreated']({ id: 'actionId' })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_CREATED
            })
        })
    })

    describe('notification:actionsDelayed', () => {
        it('should create four notifications when leader and assigned to are different', async () => {
            actionRepository.geyByIds.mockResolvedValueOnce([
                {
                    id: 'actionId',
                    leader: 'leaderId',
                    assignedTo: 'assignedToId',
                },
                {
                    id: 'actionId2',
                    leader: 'leaderId',
                    assignedTo: 'assignedToId',
                }
            ])
            const result = await eventHandler['notification:actionsDelayed']({ ids: ['actionId', 'actionId2'] })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'assignedToId' },
                    { id: 'actionId', email: 'leaderId' },
                    { id: 'actionId2', email: 'assignedToId' },
                    { id: 'actionId2', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_MARKED_AS_EXPIRED
            })
        })

        it('should create two notification when leader and assigned to are equal', async () => {
            actionRepository.geyByIds.mockResolvedValueOnce([
                {
                    id: 'actionId',
                    leader: 'assignedToId',
                    assignedTo: 'assignedToId',
                },
                {
                    id: 'actionId2',
                    leader: 'leaderId',
                    assignedTo: 'leaderId',
                }
            ])
            const result = await eventHandler['notification:actionsDelayed']({ ids: ['actionId', 'actionId2'] })

            expect(result).toBeNull()

            expect(notificationRepository.createMany).toHaveBeenCalledWith({
                actions: [
                    { id: 'actionId', email: 'assignedToId' },
                    { id: 'actionId2', email: 'leaderId' },
                ], cause: NOTIFICATION_CAUSE.ACTION_MARKED_AS_EXPIRED
            })
        })
    })
})