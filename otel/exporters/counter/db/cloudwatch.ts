import { CloudWatchClient, PutMetricDataCommand } from "@aws-sdk/client-cloudwatch"
import {MetricsAggregate} from "../src/controllers/metrics";

const cwClient = new CloudWatchClient({ region: process.env.AWS_REGION || "ap-southeast-2"});

 export const writeMetrics = async (metrics: MetricsAggregate[]): Promise<boolean> => {
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
        console.log("Inserted records successfully!!!", data);

        return true;
    } catch (err: any) {
        console.error("Error writing records:", err);

        return false;
    }
}