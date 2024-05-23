import {Attribute} from "./Attribute";
import {MetricMeasurement} from "./MetricMeasurement";

export interface ResourceMetrics {
    resource: {
        attributes: Attribute[]
    }
    scopeMetrics: ScopeMetrics[];
    schemaUrl: string;
}

export interface ScopeMetrics {
    scope: {
        name: string;
    };
    metrics: MetricMeasurement[];
}

export interface Metrics {
    resourceMetrics: ResourceMetrics[]
}