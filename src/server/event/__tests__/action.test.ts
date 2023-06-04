/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { mockDeep } from 'vitest-mock-extended';
import { describe, it, expect, beforeEach, vitest } from 'vitest'
import { ACTION_PLAN_STATUS } from '~/utils/schema/action/actionPlan';
import { createHandlersActionRepositories } from '../handler/action';
import { ACTION_STATUS } from '~/utils/schema/action/action';
import { type IBus } from '../bus';
import { LINE_PLAN_STATUS } from '~/utils/schema/action/linePlan';

describe('action event handler', () => {
    const bus: IBus = mockDeep<IBus>()
    const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
    const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()
    const linePlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[2]>()

    beforeEach(() => {
        vitest.resetAllMocks()
    })

    const eventHandler = createHandlersActionRepositories(
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

    describe('action:deleted', () => {
        it('should action:deleted event update action plan status to COMPLETED when all remeaning action are only COMPLETED and no DELAYED', async () => {
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.COMPLETED }
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:deleted"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: "actionPlanId",
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrRejected', input)
        })

        it('should action:deleted event update action plan status to COMPLETED when all remeaning action are only COMPLETED or DELETED and no DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'

            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:deleted"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: "actionPlanId",
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrRejected', input)

        })

        it('should action:deleted event update action plan status to DELAYED when at least one DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELAYED },
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: "actionPlanId",
            }
            const result = await eventHandler["action:deleted"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:atLeastOneActionDelayed', input)
        })

        it('should action:deleted event update action plan status to IN_PROGRESS when no DELAYED and remeaning actions are COMPLETED or DELETED and IN_PROGRESS', async () => {
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED }
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:deleted"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.IN_PROGRESS
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
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrRejected', input)
        })

        it('should action:updated event update action plan status to COMPLETED when all remeaning action are only COMPLETED or DELETED and no DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
                linePlanId: 'linePlanId'
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrRejected', input)
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
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
            }
            const result = await eventHandler["action:updated"](input)
            expect(result).toBe(null)
            expect(actionPlanRepository.updateStatus).toBeCalledWith({
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.DELAYED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:atLeastOneActionDelayed', input)
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
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                actionPlanId: 'actionPlanId',
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
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: LINE_PLAN_STATUS.COMPLETED },
            ])
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
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.REJECTED },
                { status: ACTION_PLAN_STATUS.DELAYED },
            ])

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

    describe('cron:check', () => {
        it('should cron:check event update all expired actions to DELAYED', async () => {
            const expiredActions = [
                { id: 'actionId11', actionPlanId: 'actionPlanId1' },
                { id: 'actionId12', actionPlanId: 'actionPlanId1' },
                { id: 'actionId42', actionPlanId: 'actionPlanId2' },
            ]
            actionRepository.getAllExpiredActions.mockResolvedValue(expiredActions)
            actionRepository.getAllByActionPlanId.mockResolvedValue([])
            const input = {
                expiryDate: new Date('2020-01-01T00:00:00.000Z')
            }
            const result = await eventHandler["cron:check"](input)
            expect(result).toBe(null)
            expect(actionRepository.updateManyStatus).toBeCalledWith({
                ids: expiredActions.map(action => action.id),
                status: ACTION_STATUS.DELAYED
            })
        })
    })
})