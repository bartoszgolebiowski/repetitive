/* eslint-disable @typescript-eslint/unbound-method */
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
            const input = { actionPlanId: 'actionPlanId' }
            bus.emit('action:updated', input)
            expect(mockHandler).toBeCalledWith(input)
        })
    })

    describe('types', () => {
        const bus: IBus = mockDeep<IBus>();

        it('all register events', () => {
            const actionEvents = [
                'action:created',
                'action:deleted',
                'action:updated',
                'action:markExpired',
                'actionPlan:allActionsCompletedOrRejected',
                'actionPlan:atLeastOneActionDelayed',
            ] as const

            const allEvents = [
                ...actionEvents,
            ] as const

            expectTypeOf(bus.on).parameter(0).toEqualTypeOf<typeof allEvents[number]>()
        })

        it('action tests', () => {
            bus.on('action:created', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })
            bus.on('action:deleted', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })

            bus.on('action:updated', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })

            bus.on('actionPlan:allActionsCompletedOrRejected', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })

            bus.on('actionPlan:atLeastOneActionDelayed', (input) => {
                assertType<{ actionPlanId: string }>(input)
                return Promise.resolve(null)
            })

            bus.emit('action:created', { actionPlanId: 'actionPlanId' })
            bus.emit('action:deleted', { actionPlanId: 'actionPlanId' })
            bus.emit('action:updated', { actionPlanId: 'actionPlanId' })
            bus.emit('actionPlan:atLeastOneActionDelayed', { actionPlanId: 'linePlanId' })
            bus.emit('actionPlan:allActionsCompletedOrRejected', { actionPlanId: 'linePlanId' })
            bus.emit('action:markExpired', { expiryDate: new Date() })
        })
    })
})