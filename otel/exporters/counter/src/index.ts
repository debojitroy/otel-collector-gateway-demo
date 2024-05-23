import { Elysia } from "elysia";
import { getMetricsAggregate } from "./controllers/metrics";
import {Metrics} from "./types/Metrics";
import {writeMetrics} from "../db/timestream";

const dimension = "service.name"

const app
    = new Elysia().group("/v1",
            app => app.post("metrics", async ({ body }:any) => {
                console.log(JSON.stringify(body));

                // const bodyTyped: Metrics = body as Metrics;
                // const resource = getMetricsAggregate(bodyTyped, dimension);

                // const writeResult = await writeMetrics(resource);

                // return new Response(JSON.stringify({metric_aggregate: resource, write_result: writeResult}), {
                //         headers: { "Content-Type": "application/json" },
                // });
                return new Response(JSON.stringify({message: "OK"}));
        }).post("logs", async ({ body }:any) => {
                console.log(JSON.stringify(body));

                // const bodyTyped: Metrics = body as Metrics;
                // const resource = getMetricsAggregate(bodyTyped, dimension);

                // const writeResult = await writeMetrics(resource);

                // return new Response(JSON.stringify({metric_aggregate: resource, write_result: writeResult}), {
                //     headers: { "Content-Type": "application/json" },
                // });
                return new Response(JSON.stringify({message: "OK"}));
            }).post("traces", async ({ body }:any) => {
                console.log(JSON.stringify(body));

                // const bodyTyped: Metrics = body as Metrics;
                // const resource = getMetricsAggregate(bodyTyped, dimension);

                // const writeResult = await writeMetrics(resource);

                // return new Response(JSON.stringify({metric_aggregate: resource, write_result: writeResult}), {
                //     headers: { "Content-Type": "application/json" },
                // });
                return new Response(JSON.stringify({message: "OK"}));
            }))
    .listen(9867);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
