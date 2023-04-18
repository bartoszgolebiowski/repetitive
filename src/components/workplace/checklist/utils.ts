import { type RouterOutputs, type RouterInputs } from "~/utils/api";

export type RemoveUndefined<T> = T extends undefined ? never : T;
export type DefinitionTask = RemoveUndefined<
    RouterOutputs["definitionTasks"]["getByWorkplaceId"]
>[0];
export type ActionInput = RemoveUndefined<
    RouterInputs["action"]["createMany"]
>["actions"][0];

export type Action = ActionInput;
