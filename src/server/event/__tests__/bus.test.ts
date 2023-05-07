/* eslint-disable @typescript-eslint/unbound-method */
import { type DeepMockProxy, mockDeep } from 'vitest-mock-extended';
import { fromPartial } from "@total-typescript/shoehorn";
import { assertType, describe, it, expectTypeOf, vitest, expect } from 'vitest'
import { type IBus, Bus } from '../bus'

describe('bus', () => {
    describe('logic', () => {
        it('should call event handler', () => {
            const mockHandler = vitest.fn()
            const bus = new Bus(fromPartial({
                'action:created': mockHandler
            }))

            bus.emit('action:created', { actionPlanId: 'actionPlanId' })

            expect(mockHandler).toBeCalledWith({ actionPlanId: 'actionPlanId' })
        })

        it('should register handler and invoke it', () => {
            const mockHandler = vitest.fn()
            const bus = new Bus(fromPartial({}))
            bus.on('action:updated', (input) => {
                mockHandler(input)
                return Promise.resolve(null)
            })
            bus.emit('action:updated', { actionPlanId: 'actionPlanId321' })

            expect(mockHandler).toBeCalledWith({ actionPlanId: 'actionPlanId321' })
        })
    })

    describe('types', () => {
        const bus: DeepMockProxy<IBus> = mockDeep<IBus>();

        it('action tests', () => {
            expectTypeOf(bus.on).parameter(0).toEqualTypeOf<'action:created' | 'action:deleted' | 'action:updated'>()

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
        })
    })
})