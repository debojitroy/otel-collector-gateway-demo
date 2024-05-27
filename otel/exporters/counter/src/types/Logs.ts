import {Attribute} from "./Attribute";
import {LogRecord} from "./LogRecord";

export interface ResourceLogs {
    resource: {
        attributes: Attribute[]
    }
    scopeLogs: ScopeLogs[];
    schemaUrl: string;
}

export interface ScopeLogs {
    scope: {
        name: string;
    };
    logRecords: LogRecord[];
}

export interface Logs {
    resourceLogs: ResourceLogs[]
}