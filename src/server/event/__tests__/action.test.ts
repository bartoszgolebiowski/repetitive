/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */

/**
 * @vitest-environment node
 */

import { mockDeep } from 'vitest-mock-extended';
import { describe, it, expect, beforeEach, vitest } from 'vitest'
import { ACTION_PLAN_STATUS } from '~/utils/schema/action/actionPlan';
import { createHandlersAction } from '../handler/action';
import { ACTION_STATUS } from '~/utils/schema/action/action';
import { type IBus } from '../bus';
import { LINE_PLAN_STATUS } from '~/utils/schema/action/linePlan';

describe('action event handler', () => {
    const bus: IBus = mockDeep<IBus>()
    const actionRepository = mockDeep<Parameters<typeof createHandlersAction>[0]>()
    const actionPlanRepository = mockDeep<Parameters<typeof createHandlersAction>[1]>()
    const linePlanRepository = mockDeep<Parameters<typeof createHandlersAction>[2]>()

    beforeEach(() => {
        vitest.resetAllMocks()
    })

    const eventHandler = createHandlersAction(
        actionRepository,
        actionPlanRepository,
        linePlanRepository
    )(bus)

    describe('action:created', () => {
        it('should action:created event update action plan status to IN_PROGRESS and line plan to IN_PROGRESS', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: LINE_PLAN_STATUS.COMPLETED },
                { status: LINE_PLAN_STATUS.IN_PROGRESS },
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })

        it('should action:created event update action plan status to IN_PROGRESS and line plan to DELAYED', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
                { status: ACTION_PLAN_STATUS.DELAYED },
            ])

            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should action:created event update action plan status to IN_PROGRESS and line plan to IN_PROGRESS', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })
    })

    describe('action:updated', () => {
        it('should action:updated event update action plan status to COMPLETED when all remeaning action are only COMPLETED and no DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.COMPLETED }
            ])
            const eventHandler = createHandlersAction(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toHaveBeenNthCalledWith(1, 'notification:actionUpdate', { id: input.id })
            expect(bus.emit).toHaveBeenNthCalledWith(2, 'actionPlan:allActionsCompletedOrRejected', { actionPlanId: input.actionPlanId })
        })

        it('should action:updated event update action plan status to COMPLETED when all remeaning action are only COMPLETED or DELETED and no DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
            ])
            const eventHandler = createHandlersAction(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toHaveBeenNthCalledWith(1, 'notification:actionUpdate', { id: input.id })
            expect(bus.emit).toHaveBeenNthCalledWith(2, 'actionPlan:allActionsCompletedOrRejected', { actionPlanId: input.actionPlanId })
        })

        it('should action:updated event update action plan status to DELAYED when at least one DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELAYED }
            ])
            const eventHandler = createHandlersAction(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(bus.emit).toHaveBeenNthCalledWith(1, 'notification:actionUpdate', { id: input.id })
            expect(bus.emit).toHaveBeenNthCalledWith(2, 'actionPlan:atLeastOneActionDelayed', { actionPlanId: input.actionPlanId })
        })

        it('should action:updated event update action plan status to IN_PROGRESS when no DELAYED and remeaning actions are COMPLETED or DELETED and IN_PROGRESS', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ])
            const eventHandler = createHandlersAction(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
        })
    })

    describe('actionPlan:allActionsCompletedOrRejected', () => {
        it('should actionPlan:allActionsCompletedOrRejected event update action plan status to COMPLETED and line plan to COMPLETED', async () => {
            const actions = [{ status: ACTION_STATUS.COMPLETED }]
            const actionPlans = [{ status: ACTION_PLAN_STATUS.COMPLETED }]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }

            const result = await eventHandler["actionPlan:allActionsCompletedOrRejected"](input)

            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: ACTION_PLAN_STATUS.COMPLETED
            })
        })

        it('should actionPlan:allActionsCompletedOrRejected event update action plan status to COMPLETED and line plan to DELAYED', async () => {
            const actions = [{ status: ACTION_STATUS.COMPLETED }]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.REJECTED },
                { status: ACTION_PLAN_STATUS.DELAYED },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }

            const result = await eventHandler["actionPlan:allActionsCompletedOrRejected"](input)

            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should actionPlan:allActionsCompletedOrRejected event update action plan status to COMPLETED and line plan to IN_PROGRESS', async () => {
            const actions = [{ status: ACTION_STATUS.COMPLETED }]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
                { status: ACTION_PLAN_STATUS.REJECTED },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }

            const result = await eventHandler["actionPlan:allActionsCompletedOrRejected"](input)

            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })
    })

    describe('actionPlan:atLeastOneActionDelayed', () => {
        it('should actionPlan:atLeastOneActionDelayed event update action plan status to DELEYED and line plan to IN_PROGRESS', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELAYED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["actionPlan:atLeastOneActionDelayed"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: ACTION_PLAN_STATUS.DELAYED
            })
        })

        it('should actionPlan:atLeastOneActionDelayed event update action plan status to DELEYED and line plan to DELAYED', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELAYED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ])

            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["actionPlan:atLeastOneActionDelayed"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should actionPlan:allActionsCompletedOrRejected event update action plan status to DELEYED and line plan to IN_PROGRESS', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELAYED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["actionPlan:atLeastOneActionDelayed"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId',
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })
    })

    describe('action:markExpired', () => {
        it('should action:markExpired do not update status, when getAllExpiredActions returns an empty array', async () => {
            actionRepository.getAllExpiredActions.mockResolvedValue([])

            const input = {
                expiryDate: new Date('2020-01-01T00:00:00.000Z')
            }
            const result = await eventHandler["action:markExpired"](input)
            expect(result).toBe(null)
            
            expect(actionRepository.getAllExpiredActions).toBeCalled()
            expect(actionRepository.updateManyStatus).not.toBeCalled()
            expect(actionPlanRepository.updateStatus).not.toBeCalled()
            expect(bus.emit).not.toBeCalled()
        })

        it('should action:markExpired event update all expired actions to DELAYED', async () => {
            const expiredActions = [
                { id: 'actionId11', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
                { id: 'actionId12', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
                { id: 'actionId42', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
            ]

            actionRepository.getAllExpiredActions.mockResolvedValue(expiredActions)
            actionRepository.getAllByActionPlanId.mockResolvedValue(expiredActions)
            actionPlanRepository.updateStatus.mockResolvedValue({
                linePlanId: 'linePlanId', id: 'actionPlanId1'
            })
            const input = {
                expiryDate: new Date('2020-01-01T00:00:00.000Z')
            }
            const result = await eventHandler["action:markExpired"](input)
            expect(result).toBe(null)

            expect(actionRepository.updateManyStatus).toBeCalledWith({
                ids: expiredActions.map(action => action.id),
                status: ACTION_STATUS.DELAYED
            })

            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: 'actionPlanId1',
                status: ACTION_PLAN_STATUS.DELAYED
            })

            expect(bus.emit).toBeCalledWith('actionPlan:atLeastOneActionDelayed', {
                actionPlanId: 'actionPlanId1'
            })
        })
    })
})