import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch"
import {MetricsAggregate} from "../src/controllers/metrics";
import {AbstractExporterPersister} from "./AbstractExporterPersister";
import {LogsAggregate} from "../src/controllers/logs";
import {TracesAggregate} from "../src/controllers/traces";

const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || "ap-southeast-2"});

export class CloudwatchWriter extends AbstractExporterPersister {
    constructor() {
        super();
    }

    async writeLogs(logs: LogsAggregate[]): Promise<boolean> {
        const records: any = []

        logs.forEach(log => {
            records.push({
                MetricName: "published_logs_bytes",
                Dimensions: [
                    {
                        Name: log.dimensionName,
                        Value: log.dimensionValue,
                    },
                ],
                Unit: "None",
                Value: log.logBytes
            });
        });

        const params = new PutMetricDataCommand({
            MetricData: records,
            Namespace: "OTEL_CUSTOM/COUNTER",
        });

        try {
            const data = await cwClient.send(params);
            console.log("writeLogs::Inserted records successfully!!!", data);

            return true;
        } catch (err: any) {
            console.error("writeLogs::Error writing records:", err);

            return false;
        }
    }

    async writeMetrics(metrics: MetricsAggregate[]): Promise<boolean> {
        const records: any = []

        metrics.forEach(metric => {
            records.push({
                MetricName: "published_metric_count",
                Dimensions: [
                    {
                        Name: metric.dimensionName,
                        Value: metric.dimensionValue,
                    },
                ],
                Unit: "None",
                Value: metric.metricsCount
            });
        });

        const params = new PutMetricDataCommand({
            MetricData: records,
            Namespace: "OTEL_CUSTOM/COUNTER",
        });

        try {
            const data = await cwClient.send(params);
            console.log("writeMetrics::Inserted records successfully!!!", data);

            return true;
        } catch (err: any) {
            console.error("writeMetrics::Error writing records:", err);

            return false;
        }
    }

    async writeTraces(traces: TracesAggregate[]): Promise<boolean> {
        const records: any = []

        traces.forEach(trace => {
            records.push({
                MetricName: "published_span_count",
                Dimensions: [
                    {
                        Name: trace.dimensionName,
                        Value: trace.dimensionValue,
                    },
                ],
                Unit: "None",
                Value: trace.spanCount
            });
        });

        const params = new PutMetricDataCommand({
            MetricData: records,
            Namespace: "OTEL_CUSTOM/COUNTER",
        });

        try {
            const data = await cwClient.send(params);
            console.log("writeTraces::Inserted records successfully!!!", data);

            return true;
        } catch (err: any) {
            console.error("writeTraces::Error writing records:", err);

            return false;
        }
    }
}
