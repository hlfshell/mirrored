import { Attribute } from "./Attribute";

export interface FunctionResult {
    success: boolean,
    result: string,
    attributes: Attribute[]
};