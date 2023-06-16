/* eslint-disable @typescript-eslint/unbound-method */

/**
 * @vitest-environment node
 */

import { mockDeep } from 'vitest-mock-extended';
import { assertType, describe, it, expectTypeOf, vitest, expect } from 'vitest'
import { type IBus, Bus } from '../bus'

describe('bus', () => {
    describe('logic', () => {

        it('should register handler and invoke it', () => {
            const mockHandler = vitest.fn()
            const bus = new Bus()
            bus.on('action:updated', (input) => {
                mockHandler(input)
                return Promise.resolve(null)
            })
            const input = { actionPlanId: 'actionPlanId', id: 'id' }
            bus.emit('action:updated', input)
            expect(mockHandler).toBeCalledWith(input)
        })
    })

    describe('types', () => {
        const bus: IBus = mockDeep<IBus>();

        it('all register events', () => {
            const actionEvents = [
                'action:imported',
                'action:created',
                'action:updated',
                'action:syncStatuses',
                'actionPlan:syncStatuses',
            ] as const

            const notificationEvents = [
                "notification:actionCreated",
                "notification:actionUpdated",
                "notification:actionsDelayed",
            ] as const
            const allEvents = [
                ...actionEvents,
                ...notificationEvents
            ] as const

            expectTypeOf(bus.on).parameter(0).toEqualTypeOf<typeof allEvents[number]>()
        })

        it('action tests', () => {
            bus.on('action:created', (input) => {
                assertType<{ actionPlanId: string, id: string }>(input)
                return Promise.resolve(null)
            })

            bus.on('action:updated', (input) => {
                assertType<{ actionPlanId: string, id: string }>(input)
                return Promise.resolve(null)
            })

            bus.on('actionPlan:syncStatuses', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })

            bus.emit('action:created', { actionPlanId: 'actionPlanId', id: 'id' })
            bus.emit('action:updated', { id: 'id', actionPlanId: 'actionPlanId' })
            bus.emit('action:imported', { expiryDate: new Date(), ids: ['1', '2'] })
            bus.emit('action:syncStatuses', { expiryDate: new Date() })
            bus.emit('actionPlan:syncStatuses', { actionPlanId: 'linePlanId' })

            bus.emit('notification:actionUpdated', { id: 'id' })
            bus.emit('notification:actionCreated', { id: 'id' })
            bus.emit('notification:actionsDelayed', { ids: ['id'] })
        })
    })
})