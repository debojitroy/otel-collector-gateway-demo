import {Attribute} from "./Attribute";

export interface LogRecord {
    timeUnixNano: string
    severityNumber: number
    severityText: string
    body: Body
    attributes: Attribute[]
    traceId: string
    spanId: string
}

export interface Body {
    stringValue: string
}