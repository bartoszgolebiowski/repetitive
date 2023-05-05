import React from "react";
import { produce } from 'immer'
import { stableNow } from "~/utils/date";
import type { DefinitionTask, Defect } from "./utils";
import { CHECKLIST_STATUS } from "~/utils/checklist";

type Checklist = {
    done: Record<string, boolean>;
    action: Record<string, Defect>;
};

const initialChecklist: Checklist = {
    done: {},
    action: {},
}

export const initialization = (definitionTasks: Pick<DefinitionTask, 'id' | 'status'>[]) => ({
    type: "init" as const,
    payload: {
        definitionTasks,
    }
})

export const toggleDone = (id: string) => ({
    type: "done" as const,
    payload: {
        id,
    }
})

export const toggleAction = (id: string, action: Defect | null) => ({
    type: "action" as const,
    payload: {
        id,
        action,
    }
})

type Actions = ReturnType<typeof initialization | typeof toggleDone | typeof toggleAction>;

// normally we use action, but here we use dispatchedAction to avoid confusion with the action
export const reducer = (state = initialChecklist, dispatchedAction: Actions) => {
    switch (dispatchedAction.type) {
        case "init": {
            const { definitionTasks } = dispatchedAction.payload;
            const done = definitionTasks.reduce((acc, { id, status }) => {
                const isPresent = status === CHECKLIST_STATUS.DONE;
                if (isPresent) acc[id] = true;
                return acc;
            }, {} as Record<string, boolean>);

            const action = definitionTasks.reduce((acc, { id, status }) => {
                const isPresent = status === CHECKLIST_STATUS.ACTION_REQUIRED;
                if (isPresent) acc[id] = emptyAction;

                return acc;
            }, {} as Record<string, Defect>);

            return { done, action }
        }
        case "done": {
            const { id } = dispatchedAction.payload;
            return produce(state, (draft) => {
                if (!selectAll(draft).includes(id)) {
                    draft.done[id] = true;
                    delete draft.action[id];
                    return draft;
                }
                const isDone = draft.done[id];
                if (isDone) {
                    delete draft.done[id];
                    delete draft.action[id];
                    return draft;
                }
                draft.done[id] = true;
                delete draft.action[id];
            })
        }
        case "action": {
            const { action, id } = dispatchedAction.payload;
            return produce(state, (draft) => {
                if (action) {
                    const isActionPresent = draft.action[id];
                    if (isActionPresent) {
                        delete draft.action[id];
                    } else {
                        draft.action[id] = action;
                    }
                    delete draft.done[id];
                    return draft;
                }

                delete draft.action[id];
            })
        }
        default:
            exhaustiveCheck(dispatchedAction)
            return state;
    }
}

const exhaustiveCheck = (_: never) => {
    return
}

const selectAll = (checklist: Checklist) =>
    [...Object.keys(checklist.done), ...Object.keys(checklist.action)]

const selectAction = (checklist: Checklist) => (id: string) =>
    checklist.action[id] ?? null;

const selectDone = (checklist: Checklist) => (id: string) =>
    checklist.done[id] ?? false;

export const emptyAction = {
    definitionTaskId: "",
    description: "",
    dueDate: stableNow,
    status: "TO_DO",
    assignedTo: "",
} satisfies Defect;

const extractDone = (checklist: Checklist) => (definitionTasks?: DefinitionTask[]) => {
    if (!definitionTasks) throw new Error("definitionTasks is undefined");

    return Object.entries(checklist.done).reduce(
        (acc, [definitionTaskId, done]) => {
            const idDisabled =
                definitionTasks.find(
                    (definitionTask) => definitionTask.id === definitionTaskId
                )?.derived.disabled ?? false;

            if (done && !idDisabled) {
                acc.push(definitionTaskId);
            }
            return acc;
        },
        [] as string[]
    );
}

const extractAction = (checklist: Checklist) => () => Object.entries(checklist.action).reduce(
    (acc, [, action]) => {
        if (action === emptyAction) return acc;
        acc.push(action);
        return acc;
    },
    [] as Defect[]
)


const useChecklist = (initial = initialChecklist) => {
    const [checklist, dispatch] = React.useReducer(reducer, initial);

    const onDoneChange = (id: string) => () => {
        dispatch(toggleDone(id));
    };

    const onActionChange = (id: string) => (action: Defect | null) => {
        dispatch(toggleAction(id, action));
    };

    const onInit = (definitionTasks: DefinitionTask[]) => {
        dispatch(initialization(definitionTasks));
    };

    return {
        onDoneChange,
        onActionChange,
        onInit,
        selectActionById: selectAction(checklist),
        selectDoneById: selectDone(checklist),
        extractDone: extractDone(checklist),
        extractAction: extractAction(checklist),
    };
};

export default useChecklist;