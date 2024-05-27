import { Logs } from "../types/Logs";

export interface LogsAggregate {
    dimensionName: string;
    dimensionValue: string;
    logBytes: number;
}

const byteSize = (str: string) => new Blob([str]).size;

export const getLogsAggregate = (payload: Logs, dimensionName: string): LogsAggregate[] => {
    const logsMap = new Map<string, LogsAggregate>();

    if (!payload || !payload.resourceLogs || !Array.isArray(payload.resourceLogs) || payload.resourceLogs.length == 0) {
        console.log("WARN::Empty Payload or resourceLogs missing")
        return [];
    }

    payload.resourceLogs.forEach((logs) => {
        // Look for the interested Key
        if (!logs.resource || !logs.resource.attributes || !Array.isArray(logs.resource.attributes) || logs.resource.attributes.length == 0) {
            // No point proceeding further as the attributes are empty
            console.log("WARN::Attributes missing in resourceLogs")
            return;
        }

        const attributeOfInterest = logs.resource.attributes.find(x => x.key === dimensionName);

        if (!attributeOfInterest) {
            // Attribute not found
            console.log("WARN::Attribute of Interest not found")
            return;
        }

        if (!attributeOfInterest.value || !attributeOfInterest.value.stringValue) {
            // No Value for the key is defined
            console.log("WARN::Attribute of Interest Value not found")
            return;
        }

        // Build map Key
        const mapKey = `${dimensionName}:${attributeOfInterest.value.stringValue}`;

        let logsAggregate = logsMap.get(mapKey);

        if (!logsAggregate) {
            logsAggregate = {
                dimensionName,
                dimensionValue: attributeOfInterest.value.stringValue,
                logBytes: 0,
            }

            logsMap.set(mapKey, logsAggregate);
        }

        // Check for Scope Metrics
        if (!logs.scopeLogs || !Array.isArray(logs.scopeLogs) || logs.scopeLogs.length == 0) {
            // No point ScopeMetrics are empty
            console.log("WARN::scopeLogs are empty")
            return;
        }

        // Each Data point Attribute
        // Counts to one measurement
        logs.scopeLogs.forEach((scopeLog) => {
            // Check if metrics exist
            if (!scopeLog.logRecords || !Array.isArray(scopeLog.logRecords) || scopeLog.logRecords.length == 0) {
                // There are no spans
                // no point proceeding
                console.log("WARN::scopeLogs has no logs")
                return;
            }

            // Add up the data points
            scopeLog.logRecords.forEach(log => {

                logsAggregate.logBytes += log.body && log.body.stringValue ? byteSize(log.body.stringValue) : 0;
            });
        })
    })

    return [...logsMap.values()];
}