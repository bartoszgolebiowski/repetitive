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
        it('should action:created event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to COMPLETED when all action plans are only COMPLETED and no DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.COMPLETED
            })
        })

        it('should action:created event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to IN_PROGRESS when all action plans are not DELAYED and at least one IN_PROGRESS', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })

        it('should action:created event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to DELAYED when at least action plan is DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.DELAYED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should action:created event update action plan status to IN_PROGRESS when all remaning actions have status COMPLETED, REJECTED and IN_PROGRESS without DELAYED, should also update linePlan to IN_PROGRESS when all action plans are not DELAYED and at least one IN_PROGRESS', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })

        it('should action:created event update action plan status to IN_PROGRESS when all remeaning action have status COMPLETED, REJECTED and IN_PROGRESS without DELAYED, should also update linePlan to DELAYED when at least action plan is DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.IN_PROGRESS }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.DELAYED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            const result = await eventHandler["action:created"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should action:created event send an event that action has been updated', async () => {
            const actions = [
                { status: ACTION_STATUS.IN_PROGRESS }
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.IN_PROGRESS }
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            await eventHandler["action:created"](input)
            expect(bus.emit).toBeCalledWith('notification:actionCreated', {
                id: input.id
            })
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })
    })

    describe('action:updated', () => {
        it('should action:updated event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to COMPLETED when all action plans are only COMPLETED and no DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

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
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.COMPLETED
            })
        })

        it('should action:updated event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to IN_PROGRESS when all action plans are not DELAYED and at least one IN_PROGRESS', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

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
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })

        it('should action:updated event update action plan status to COMPLETED when all remeaning actions are only COMPLETED or REJECTED, should also update linePlan to DELAYED when at least action plan is DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.DELAYED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

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
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should action:updated event update action plan status to IN_PROGRESS when all remaning actions have status COMPLETED, REJECTED and IN_PROGRESS without DELAYED, should also update linePlan to IN_PROGRESS when all action plans are not DELAYED and at least one IN_PROGRESS', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.IN_PROGRESS },
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

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
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })

        it('should action:updated event update action plan status to IN_PROGRESS when all remeaning action have status COMPLETED, REJECTED and IN_PROGRESS without DELAYED, should also update linePlan to DELAYED when at least action plan is DELAYED', async () => {
            const actions = [
                { status: ACTION_STATUS.REJECTED },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.IN_PROGRESS }
            ]
            const actionPlans = [
                { status: ACTION_PLAN_STATUS.DELAYED },
                { status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })

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
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.DELAYED
            })
        })

        it('should action:updated event send an event that action has been updated', async () => {
            const actions = [
                { status: ACTION_STATUS.IN_PROGRESS }
            ]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.IN_PROGRESS }
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
                id: 'id'
            }
            await eventHandler["action:updated"](input)
            expect(bus.emit).toBeCalledWith('notification:actionUpdated', {
                id: input.id
            })
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
            })
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: 'linePlanId',
                status: LINE_PLAN_STATUS.IN_PROGRESS
            })
        })
    })

    describe('action:syncStatuses', () => {
        it('should action:syncStatuses does not update status, when getAllExpiredActions returns an empty array', async () => {
            actionRepository.getAllExpiredActions.mockResolvedValue([])

            const input = {
                expiryDate: new Date('2020-01-01T00:00:00.000Z')
            }
            const result = await eventHandler["action:syncStatuses"](input)
            expect(result).toBe(null)

            expect(actionRepository.getAllExpiredActions).toBeCalled()
            expect(actionRepository.updateManyStatus).not.toBeCalled()
            expect(actionPlanRepository.updateStatus).not.toBeCalled()
            expect(linePlanRepository.updateStatus).not.toBeCalled()
        })

        it('should action:syncStatuses event update all expired actions to DELAYED and all related action plans to DELAYED and all relayed line plans to DELAYED', async () => {
            const actionForActionPlan = [
                { id: 'actionId11', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
                { id: 'actionId41', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
                { id: 'actionId41', actionPlanId: 'actionPlanId1', status: ACTION_STATUS.DELAYED },
            ]

            const expiredActions = [
                { id: 'actionId12', actionPlanId: 'actionPlanId2', status: ACTION_STATUS.DELAYED },
                ...actionForActionPlan
            ]

            const actionPlans = [
                { id: 'actionPlanId1', linePlanId: 'linePlanId', status: ACTION_PLAN_STATUS.DELAYED },
                { id: 'actionPlanId2', linePlanId: 'linePlanId', status: ACTION_PLAN_STATUS.IN_PROGRESS },
                { id: 'actionPlanId3', linePlanId: 'linePlanId', status: ACTION_PLAN_STATUS.IN_PROGRESS },
            ]

            actionRepository.getAllExpiredActions.mockResolvedValue(expiredActions)
            actionRepository.getAllByActionPlanId.mockResolvedValue(actionForActionPlan)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                linePlanId: 'linePlanId', id: 'actionPlanId1'
            })
            const input = {
                expiryDate: new Date('2020-01-01T00:00:00.000Z')
            }
            const result = await eventHandler["action:syncStatuses"](input)
            expect(result).toBe(null)

            expect(actionRepository.updateManyStatus).toBeCalledWith({
                ids: expiredActions.map(action => action.id),
                status: ACTION_STATUS.DELAYED
            })

            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: actionForActionPlan[0]?.actionPlanId,
                status: ACTION_PLAN_STATUS.DELAYED
            })

            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: actionPlans[0]?.linePlanId,
                status: LINE_PLAN_STATUS.DELAYED
            })
        })
    })

    describe('actionPlan:syncStatuses', () => {
        it('should actionPlan:syncStatuses event update action plan status to COMPLETED and line plan to COMPLETED if all action are completed and all action plans are COMPLETED', async () => {
            const actions = [{ status: ACTION_STATUS.COMPLETED }]
            const actionPlans = [{ status: ACTION_PLAN_STATUS.COMPLETED }, { status: ACTION_PLAN_STATUS.COMPLETED }]
            actionRepository.getAllByActionPlanId.mockResolvedValue(actions)
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue(actionPlans)
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const input = {
                actionPlanId: 'actionPlanId',
            }

            const result = await eventHandler["actionPlan:syncStatuses"](input)

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

        it('should actionPlan:syncStatuses event update action plan status to COMPLETED and line plan to DELAYED, if all action are completed and  at least one action plan is DELAYED', async () => {
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

            const result = await eventHandler["actionPlan:syncStatuses"](input)

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

        it('should actionPlan:syncStatuses event update action plan status to COMPLETED and line plan to IN_PROGRESS, if all action are completed and  0 action plans are DELAYED but not all action plans are COMPLETED', async () => {
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

            const result = await eventHandler["actionPlan:syncStatuses"](input)

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

        it('should actionPlan:syncStatuses event update action plan status to IN_PROGRESS and line plan to DELAYED, if all not actions are completed and 0 actions are DELAYED and and at least one action plan is DELAYED', async () => {
            const actions = [{ status: ACTION_STATUS.COMPLETED }, { status: ACTION_STATUS.IN_PROGRESS }]
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

            const result = await eventHandler["actionPlan:syncStatuses"](input)

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

        it('should actionPlan:syncStatuses event update action plan status to DELAYED and line plan to DELAYED, when at least one action is DELAYED', async () => {
            const actions = [{ status: ACTION_STATUS.DELAYED }, { status: ACTION_STATUS.IN_PROGRESS }]
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

            const result = await eventHandler["actionPlan:syncStatuses"](input)

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
})