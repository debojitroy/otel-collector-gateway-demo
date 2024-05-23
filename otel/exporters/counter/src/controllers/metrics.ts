import {Metrics} from "../types/Metrics";

export interface MetricsAggregate {
    dimensionName: string;
    dimensionValue: string;
    metricsCount: number;
}

export const getMetricsAggregate = (payload: Metrics, dimensionName: string): MetricsAggregate[] => {
    const metricMap = new Map<string, MetricsAggregate>();

    if (!payload || !payload.resourceMetrics || !Array.isArray(payload.resourceMetrics) || payload.resourceMetrics.length == 0) {
        console.log("WARN::Empty Payload or resourceMetrics missing")
        return [];
    }

    payload.resourceMetrics.forEach((resourceMetrics) => {
        // Look for the interested Key
        if (!resourceMetrics.resource || !resourceMetrics.resource.attributes || !Array.isArray(resourceMetrics.resource.attributes) || resourceMetrics.resource.attributes.length == 0) {
            // No point proceeding further as the attributes are empty
            console.log("WARN::Attributes missing in resourceMetrics")
            return;
        }

        const attributeOfInterest = resourceMetrics.resource.attributes.find(x => x.key === dimensionName);

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

        let metricAggregate = metricMap.get(mapKey);

        if (!metricAggregate) {
            metricAggregate = {
                dimensionName,
                dimensionValue: attributeOfInterest.value.stringValue,
                metricsCount: 0,
            }

            metricMap.set(mapKey, metricAggregate);
        }

        // Check for Scope Metrics
        if (!resourceMetrics.scopeMetrics || !Array.isArray(resourceMetrics.scopeMetrics) || resourceMetrics.scopeMetrics.length == 0) {
            // No point ScopeMetrics are empty
            console.log("WARN::ScopeMetrics are empty")
            return;
        }

        // Each Data point Attribute
        // Counts to one measurement
        resourceMetrics.scopeMetrics.forEach((scopeMetric) => {
            // Check if metrics exist
            if (!scopeMetric.metrics || !Array.isArray(scopeMetric.metrics) || scopeMetric.metrics.length == 0) {
                // There are no metrics
                // no point proceeding
                console.log("WARN::ScopeMetrics has no metrics")
                return;
            }

            // Add up the data points
            scopeMetric.metrics.forEach((metric) => {
                if (metric.sum && metric.sum.dataPoints && Array.isArray(metric.sum.dataPoints)) {
                    metric.sum.dataPoints.forEach(dataPoint => {
                        if (dataPoint.attributes && Array.isArray(dataPoint.attributes)) {
                            metricAggregate.metricsCount += dataPoint.attributes.length;
                        }
                    });
                } else if (metric.histogram && metric.histogram.dataPoints && Array.isArray(metric.histogram.dataPoints)) {
                    metric.histogram.dataPoints.forEach(dataPoint => {
                        if (dataPoint.attributes && Array.isArray(dataPoint.attributes)) {
                            metricAggregate.metricsCount += dataPoint.attributes.length;
                        }
                    });
                } else if (metric.guage && metric.guage.dataPoints && Array.isArray(metric.guage.dataPoints)) {
                    metric.guage.dataPoints.forEach(dataPoint => {
                        if (dataPoint.attributes && Array.isArray(dataPoint.attributes)) {
                            metricAggregate.metricsCount += dataPoint.attributes.length;
                        }
                    });
                } else if (metric.exponential_histogram && metric.exponential_histogram.dataPoints && Array.isArray(metric.exponential_histogram.dataPoints)) {
                    metric.exponential_histogram.dataPoints.forEach(dataPoint => {
                        if (dataPoint.attributes && Array.isArray(dataPoint.attributes)) {
                            metricAggregate.metricsCount += dataPoint.attributes.length;
                        }
                    });
                } else if (metric.summary && metric.summary.dataPoints && Array.isArray(metric.summary.dataPoints)) {
                    metric.summary.dataPoints.forEach(dataPoint => {
                        if (dataPoint.attributes && Array.isArray(dataPoint.attributes)) {
                            metricAggregate.metricsCount += dataPoint.attributes.length;
                        }
                    });
                }
            })
        })
    })

    return [...metricMap.values()];
}