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

    it('should action:created event update action plan status to IN_PROGRESS', async () => {
        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
            linePlanRepository
        )(bus)
        const input = {
            actionPlanId: 'actionPlanId',
        }
        const result = await eventHandler["action:created"](input)
        expect(result).toBe(null)
        expect(actionPlanRepository.updateStatus).toBeCalledWith({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.IN_PROGRESS
        })
    })

    describe('action:deleted', () => {
        it('should action:deleted event update action plan status to COMPLETED when all remeaning action are COMPLETED', async () => {
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.COMPLETED }
            ])
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
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
                actionPlanId: input.actionPlanId,
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })
        })

        it('should action:deleted event update action plan status to COMPLETED when all remeaning action are COMPLETED or DELETED and no DELAYED', async () => {

            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELETED }
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
                status: ACTION_PLAN_STATUS.COMPLETED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })

        })

        it('should action:deleted event update action plan status to DELAYED when all remeaning action are COMPLETED or DELETED and at least one DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELEYED },
                { status: ACTION_STATUS.DELETED }
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
                status: ACTION_PLAN_STATUS.DELEYED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })

        })

        it('should action:deleted event update action plan status to IN_PROGRESS when at least one action is IN_PROGRESS', async () => {
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
        it('should action:updated event update action plan status to COMPLETED when all remeaning action are COMPLETED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
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
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })
        })

        it('should action:updated event update action plan status to COMPLETED when all remeaning action are COMPLETED or DELETED and no DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELETED }
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
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })

        })

        it('should action:updated event update action plan status to DELAYED when all remeaning action are COMPLETED or DELETED and at least one DELAYED', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELETED },
                { status: ACTION_STATUS.DELEYED }
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
                status: ACTION_PLAN_STATUS.DELEYED
            })
            expect(bus.emit).toBeCalledWith('actionPlan:allActionsCompletedOrDeletedOrDelayed', { linePlanId: 'actionPlanId' })
        })

        it('should action:updated event update action plan status to IN_PROGRESS when at least one action is IN_PROGRESS', async () => {
            actionPlanRepository.updateStatus.mockResolvedValue({
                id: 'actionPlanId',
            })
            actionRepository.getAllByActionPlanId.mockResolvedValue([
                { status: ACTION_STATUS.IN_PROGRESS },
                { status: ACTION_STATUS.COMPLETED },
                { status: ACTION_STATUS.DELEYED },
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

    describe('actionPlan:allActionsCompletedOrDeletedOrDelayed', () => {
        it('should actionPlan:allActionsCompletedOrDeletedOrDelayed update to line plan status to OK when all action plan are COMPLETED', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED }
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                linePlanId: 'linePlanId'
            }
            const result = await eventHandler["actionPlan:allActionsCompletedOrDeletedOrDelayed"](input)
            expect(result).toBe(null)
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: input.linePlanId,
                status: LINE_PLAN_STATUS.OK
            })
        })
        it('should actionPlan:allActionsCompletedOrDeletedOrDelayed update to line plan status to NOK when at least one action plan is not COMPLETED', async () => {
            actionPlanRepository.getAllByLinePlanId.mockResolvedValue([
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.COMPLETED },
                { status: ACTION_PLAN_STATUS.DELEYED },
            ])
            const eventHandler = createHandlersActionRepositories(
                actionRepository,
                actionPlanRepository,
                linePlanRepository
            )(bus)
            const input = {
                linePlanId: 'linePlanId'
            }
            const result = await eventHandler["actionPlan:allActionsCompletedOrDeletedOrDelayed"](input)
            expect(result).toBe(null)
            expect(linePlanRepository.updateStatus).toBeCalledWith({
                linePlanId: input.linePlanId,
                status: LINE_PLAN_STATUS.NOK
            })
        })
    })
})