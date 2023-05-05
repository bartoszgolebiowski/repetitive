import { type RouterOutputs, type RouterInputs } from "~/utils/api";

export type RemoveUndefined<T> = T extends undefined ? never : T;
export type DefinitionTask = RemoveUndefined<
    RouterOutputs["definitionTasks"]["getByplantId"]
>[0];
export type DefectInput = RemoveUndefined<
    RouterInputs["defect"]["createMany"]
>["actions"][0];

export type Defect = DefectInput;
