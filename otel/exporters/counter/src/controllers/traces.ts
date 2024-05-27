import { Traces } from "../types/Traces";

export interface TracesAggregate {
    dimensionName: string;
    dimensionValue: string;
    spanCount: number;
}

export const getTracesAggregate = (payload: Traces, dimensionName: string): TracesAggregate[] => {
    const tracesMap = new Map<string, TracesAggregate>();

    if (!payload || !payload.resourceSpans || !Array.isArray(payload.resourceSpans) || payload.resourceSpans.length == 0) {
        console.log("WARN::Empty Payload or resourceSpans missing")
        return [];
    }

    payload.resourceSpans.forEach((span) => {
        // Look for the interested Key
        if (!span.resource || !span.resource.attributes || !Array.isArray(span.resource.attributes) || span.resource.attributes.length == 0) {
            // No point proceeding further as the attributes are empty
            console.log("WARN::Attributes missing in resourceSpans")
            return;
        }

        const attributeOfInterest = span.resource.attributes.find(x => x.key === dimensionName);

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

        let tracesAggregate = tracesMap.get(mapKey);

        if (!tracesAggregate) {
            tracesAggregate = {
                dimensionName,
                dimensionValue: attributeOfInterest.value.stringValue,
                spanCount: 0,
            }

            tracesMap.set(mapKey, tracesAggregate);
        }

        // Check for Scope Metrics
        if (!span.scopeSpans || !Array.isArray(span.scopeSpans) || span.scopeSpans.length == 0) {
            // No point ScopeMetrics are empty
            console.log("WARN::scopeSpans are empty")
            return;
        }

        // Each Data point Attribute
        // Counts to one measurement
        span.scopeSpans.forEach((scopeSpan) => {
            // Check if metrics exist
            if (!scopeSpan.spans || !Array.isArray(scopeSpan.spans) || scopeSpan.spans.length == 0) {
                // There are no spans
                // no point proceeding
                console.log("WARN::ScopeSpans has no spans")
                return;
            }

            // Add up the data points
            tracesAggregate.spanCount += scopeSpan.spans.length;
        })
    })

    return [...tracesMap.values()];
}