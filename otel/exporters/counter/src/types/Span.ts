import {Attribute} from "./Attribute";

export interface Span {
    traceId: string
    spanId: string
    parentSpanId: string
    name: string
    kind: number
    startTimeUnixNano: string
    endTimeUnixNano: string
    attributes: Attribute[]
    status: any;
}