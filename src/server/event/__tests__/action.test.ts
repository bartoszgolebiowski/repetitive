/* eslint-disable @typescript-eslint/no-floating-promises */
import { mockDeep } from 'vitest-mock-extended';
import { describe, it, expect } from 'vitest'
import { ACTION_PLAN_STATUS } from '~/utils/schema/action/actionPlan';
import { createHandlersActionRepositories } from './../action';
import { ACTION_STATUS } from '~/utils/schema/action/action';

describe('action event handler', () => {
    it('should action:created event update action plan status to IN_PROGRESS', async () => {
        const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
        const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()

        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
        )
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

    it('should action:deleted event update action plan status to COMPLETED when all remeaning action are COMPLETED', async () => {
        const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
        const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()
        actionRepository.getAllByActionPlanId.mockResolvedValue([
            { status: ACTION_STATUS.COMPLETED },
            { status: ACTION_STATUS.COMPLETED }
        ])
        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
        )
        const input = {
            actionPlanId: 'actionPlanId',
        }
        const result = await eventHandler["action:deleted"](input)
        expect(result).toBe(null)
        expect(actionPlanRepository.updateStatus).toBeCalledWith({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.COMPLETED
        })
    })

    it('should not action:deleted event update action plan status to COMPLETED when not all remeaning action are COMPLETED', async () => {
        const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
        const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()
        actionRepository.getAllByActionPlanId.mockResolvedValue([
            { status: ACTION_STATUS.IN_PROGRESS },
            { status: ACTION_STATUS.COMPLETED }
        ])
        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
        )
        const input = {
            actionPlanId: 'actionPlanId',
        }
        const result = await eventHandler["action:deleted"](input)
        expect(result).toBe(null)
        expect(actionPlanRepository.updateStatus).not.toBeCalled()
    })

    it('should action:updated event update action plan status to COMPLETED when all remeaning action are COMPLETED', async () => {
        const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
        const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()
        actionRepository.getAllByActionPlanId.mockResolvedValue([
            { status: ACTION_STATUS.COMPLETED },
            { status: ACTION_STATUS.COMPLETED }
        ])
        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
        )
        const input = {
            actionPlanId: 'actionPlanId',
        }
        const result = await eventHandler["action:updated"](input)
        expect(result).toBe(null)
        expect(actionPlanRepository.updateStatus).toBeCalledWith({
            actionPlanId: input.actionPlanId,
            status: ACTION_PLAN_STATUS.COMPLETED
        })
    })

    it('should action:updated event update action plan status to IN_PROGRESS when not all remeaning action are COMPLETED', async () => {
        const actionRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[0]>()
        const actionPlanRepository = mockDeep<Parameters<typeof createHandlersActionRepositories>[1]>()
        actionRepository.getAllByActionPlanId.mockResolvedValue([
            { status: ACTION_STATUS.IN_PROGRESS },
            { status: ACTION_STATUS.COMPLETED }
        ])
        const eventHandler = createHandlersActionRepositories(
            actionRepository,
            actionPlanRepository,
        )
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