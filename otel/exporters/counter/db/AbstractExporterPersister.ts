import {MetricsAggregate} from "../src/controllers/metrics";
import {TracesAggregate} from "../src/controllers/traces";
import {LogsAggregate} from "../src/controllers/logs";

export abstract class AbstractExporterPersister {
    public abstract writeMetrics(metrics: MetricsAggregate[]): Promise<boolean>;
    public abstract writeTraces(metrics: TracesAggregate[]): Promise<boolean>;
    public abstract writeLogs(metrics: LogsAggregate[]): Promise<boolean>;
}