import { TimestreamWriteClient,_Record, WriteRecordsCommand} from "@aws-sdk/client-timestream-write";
import {MetricsAggregate} from "../src/controllers/metrics";
import {AbstractExporterPersister} from "./AbstractExporterPersister";
import {LogsAggregate} from "../src/controllers/logs";
import {TracesAggregate} from "../src/controllers/traces";

const writeClient = new TimestreamWriteClient ({ region: process.env.AWS_REGION || "ap-southeast-2"  });
const DatabaseName = process.env.OTEL_TS_DB;
const TableName = process.env.OTEL_TS_TABLE;

export class TimestreamWriter extends AbstractExporterPersister {
    constructor() {
        super();
    }

    private printRejectedRecordsException = (err: any) => {
        console.error("Error writing records: RejectedRecordsException: One or more records have been rejected. See RejectedRecords for details.");
        err.RejectedRecords.forEach((rr: any) => {
            console.error(`Rejected Index ${rr.RecordIndex}: ${rr.Reason}`);
            if (rr.ExistingVersion) {
                console.error(`Rejected record existing version: ${rr.ExistingVersion}`);
            }
        })
    }

    async writeLogs(logs: LogsAggregate[]): Promise<boolean> {
        const currentTime = Date.now().toString(); // Unix time in milliseconds
        const records: _Record[] = [];

        logs.forEach(log => {
            records.push({
                Dimensions: [{
                    Name: log.dimensionName,
                    Value: log.dimensionValue
                }],
                MeasureName: 'log_bytes',
                MeasureValue: log.logBytes.toString(),
                MeasureValueType: 'BIGINT',
                Time: currentTime.toString(),
            });
        });

        const params = new WriteRecordsCommand({
            DatabaseName,
            TableName,
            Records: records,
        });

        try {
            const data = await writeClient.send(params);
            console.log("writeLogs::Inserted records successfully!!!", data.RecordsIngested);

            return true;
        } catch (err: any) {
            if (err.name === 'RejectedRecordsException') {
                this.printRejectedRecordsException(err);
            } else {
                console.error("writeLogs::Error writing records:", err);
            }

            return false;
        }
    }

    async writeMetrics(metrics: MetricsAggregate[]): Promise<boolean> {
        const currentTime = Date.now().toString(); // Unix time in milliseconds
        const records: _Record[] = [];

        metrics.forEach(metric => {
            records.push({
                Dimensions: [{
                    Name: metric.dimensionName,
                    Value: metric.dimensionValue
                }],
                MeasureName: 'metric_count',
                MeasureValue: metric.metricsCount.toString(),
                MeasureValueType: 'BIGINT',
                Time: currentTime.toString(),
            });
        });

        const params = new WriteRecordsCommand({
            DatabaseName,
            TableName,
            Records: records,
        });

        try {
            const data = await writeClient.send(params);
            console.log("writeMetrics::Inserted records successfully!!!", data.RecordsIngested);

            return true;
        } catch (err: any) {
            if (err.name === 'RejectedRecordsException') {
                this.printRejectedRecordsException(err);
            } else {
                console.error("writeMetrics::Error writing records:", err);
            }

            return false;
        }
    }

    async writeTraces(traces: TracesAggregate[]): Promise<boolean> {
        const currentTime = Date.now().toString(); // Unix time in milliseconds
        const records: _Record[] = [];

        traces.forEach(trace => {
            records.push({
                Dimensions: [{
                    Name: trace.dimensionName,
                    Value: trace.dimensionValue
                }],
                MeasureName: 'span_count',
                MeasureValue: trace.spanCount.toString(),
                MeasureValueType: 'BIGINT',
                Time: currentTime.toString(),
            });
        });

        const params = new WriteRecordsCommand({
            DatabaseName,
            TableName,
            Records: records,
        });

        try {
            const data = await writeClient.send(params);
            console.log("writeTraces::Inserted records successfully!!!", data.RecordsIngested);

            return true;
        } catch (err: any) {
            if (err.name === 'RejectedRecordsException') {
                this.printRejectedRecordsException(err);
            } else {
                console.error("writeTraces::Error writing records:", err);
            }

            return false;
        }
    }
}