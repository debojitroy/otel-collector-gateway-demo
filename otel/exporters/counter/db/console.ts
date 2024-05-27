import {MetricsAggregate} from "../src/controllers/metrics";
import {TracesAggregate} from "../src/controllers/traces";
import {AbstractExporterPersister} from "./AbstractExporterPersister";
import {LogsAggregate} from "../src/controllers/logs";

export class ConsoleWriter extends AbstractExporterPersister {

    constructor() {
        super();
    }

    public async writeMetrics(metrics: MetricsAggregate[]): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            console.log("---------------METRICS AGGREGATE START------------------");
            console.log(JSON.stringify(metrics));
            console.log("---------------METRICS AGGREGATE END------------------");

            return resolve(true);
        });
    }

    writeLogs(logs: LogsAggregate[]): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            console.log("---------------LOGS AGGREGATE START------------------");
            console.log(JSON.stringify(logs));
            console.log("---------------LOGS AGGREGATE END------------------");

            return resolve(true);
        });
    }

    writeTraces(traces: TracesAggregate[]): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            console.log("---------------TRACES AGGREGATE START------------------");
            console.log(JSON.stringify(traces));
            console.log("---------------TRACES AGGREGATE END------------------");

            return resolve(true);
        });
    }
}