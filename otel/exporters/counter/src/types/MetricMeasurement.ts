import {Attribute} from "./Attribute";

export interface DataPoint {
    attributes: Attribute[];
    // Ignoring the measurements
}

export interface MetricMeasurement {
    name: string;
    unit: string;
    sum?: {
        dataPoints: DataPoint[];
    };
    guage?: {
        dataPoints: DataPoint[];
    };
    histogram?: {
        dataPoints: DataPoint[];
    };
    exponential_histogram?: {
        dataPoints: DataPoint[];
    };
    summary?: {
        dataPoints: DataPoint[];
    };
}