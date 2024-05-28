import { Elysia } from "elysia";
import { getMetricsAggregate } from "./controllers/metrics";
import { getLogsAggregate } from "./controllers/logs";
import { getTracesAggregate } from "./controllers/traces";
import {Metrics} from "./types/Metrics";
import { AbstractExporterPersister  } from "../db/AbstractExporterPersister";
// import { ConsoleWriter } from "../db/console";
// import { TimestreamWriter } from '../db/timestream';
import {Logs} from "./types/Logs";
import {Traces} from "./types/Traces";
import {CloudwatchWriter} from "../db/cloudwatch";

const dimension = "service.name"
const writer: AbstractExporterPersister = new CloudwatchWriter();

const app
    = new Elysia().group("/v1",
            app => app.post("metrics", async ({ body }:any) => {
                console.log("---------------METRICS START------------------");

                console.log(JSON.stringify(body));
                const bodyTyped: Metrics = body as Metrics;
                const resource = getMetricsAggregate(bodyTyped, dimension);
                const writeResult = await writer.writeMetrics(resource);

                console.log("---------------METRICS END------------------");
                return new Response(JSON.stringify({metric_aggregate: resource, write_result: writeResult}), {
                        headers: { "Content-Type": "application/json" },
                });
        }).post("logs", async ({ body }:any) => {
                console.log("---------------LOGS START------------------");

                console.log(JSON.stringify(body));
                const bodyTyped: Logs = body as Logs;
                const resource = getLogsAggregate(bodyTyped, dimension);
                const writeResult = await writer.writeLogs(resource);

                console.log("---------------LOGS END------------------");
                return new Response(JSON.stringify({logs_aggregate: resource, write_result: writeResult}), {
                    headers: { "Content-Type": "application/json" },
                });
            }).post("traces", async ({ body }:any) => {
                console.log("---------------TRACES START------------------");

                console.log(JSON.stringify(body));
                const bodyTyped: Traces = body as Traces;
                const resource = getTracesAggregate(bodyTyped, dimension);
                const writeResult = await writer.writeTraces(resource);

                console.log("---------------TRACES END------------------");
                return new Response(JSON.stringify({traces_aggregate: resource, write_result: writeResult}), {
                    headers: { "Content-Type": "application/json" },
                });
            }))
    .listen(9867);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
