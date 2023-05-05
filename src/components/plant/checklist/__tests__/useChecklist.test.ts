import { describe, expect, it } from "vitest";
import { emptyAction, initialization, reducer, toggleAction, toggleDone } from '../useChecklist'
import { CHECKLIST_STATUS } from "~/utils/checklist";

describe('useChecklist', () => {
    describe('reducer', () => {
        const initialized = {
            done: {
                '1': true,
                '2': true,
                '3': true,
            },
            action: {
                '4': emptyAction,
                '5': emptyAction,
            }
        }

        it('should initialize the checklist', () => {
            const actualState = reducer(undefined, initialization([
                {
                    id: '1',
                    status: CHECKLIST_STATUS.DONE
                },
                {
                    id: '2',
                    status: CHECKLIST_STATUS.DONE
                },
                {
                    id: '3',
                    status: CHECKLIST_STATUS.DONE
                },
                {
                    id: '4',
                    status: CHECKLIST_STATUS.ACTION_REQUIRED
                },
                {
                    id: '5',
                    status: CHECKLIST_STATUS.ACTION_REQUIRED
                },
                {
                    id: '6',
                    status: CHECKLIST_STATUS.MISSING
                },
                {
                    id: '7',
                    status: CHECKLIST_STATUS.MISSING
                },
            ]))
            expect(actualState).toEqual(initialized)
        })

        it('should toggle done when id is not present', () => {
            const actualState = reducer(initialized, toggleDone('6'))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                    '6': true,
                },
                action: {
                    '4': emptyAction,
                    '5': emptyAction,
                }
            })
        })

        it('should toggle done when id is present in done', () => {
            const actualState = reducer(initialized, toggleDone('2'))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '3': true,
                },
                action: {
                    '4': emptyAction,
                    '5': emptyAction,
                }
            })
        })

        it('should toggle done when id is present in action', () => {
            const actualState = reducer(initialized, toggleDone('4'))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                    '4': true,
                },
                action: {
                    '5': emptyAction,
                }
            })
        })

        it('should toggle action when id is not present', () => {
            const actualState = reducer(initialized, toggleAction('6', emptyAction))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                },
                action: {
                    '4': emptyAction,
                    '5': emptyAction,
                    '6': emptyAction,
                }
            })
        })

        it('should toggle action when id is present in done', () => {
            const actualState = reducer(initialized, toggleAction('2', emptyAction))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '3': true,
                },
                action: {
                    '2': emptyAction,
                    '4': emptyAction,
                    '5': emptyAction,
                }
            })
        })

        it('should toggle action when id is present in action', () => {
            const actualState = reducer(initialized, toggleAction('4', emptyAction))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                },
                action: {
                    '5': emptyAction,
                }
            })
        })

        it('should toggle action when id is not present, action is null', () => {
            const actualState = reducer(initialized, toggleAction('6', null))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                },
                action: {
                    '4': emptyAction,
                    '5': emptyAction,
                }
            })
        })

        it('should toggle action when id is present in done, action is null', () => {
            const actualState = reducer(initialized, toggleAction('2', null))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                },
                action: {
                    '4': emptyAction,
                    '5': emptyAction,
                }
            })
        })

        it('should toggle action when id is present in action, action is null', () => {
            const actualState = reducer(initialized, toggleAction('4', null))
            expect(actualState).toEqual({
                done: {
                    '1': true,
                    '2': true,
                    '3': true,
                },
                action: {
                    '5': emptyAction,
                }
            })
        })
    });
})