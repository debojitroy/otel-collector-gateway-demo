import { Elysia } from "elysia";
import {trace, metrics, type Span} from "@opentelemetry/api";
import {logInfo, logError} from "./otel/logger";

const port = parseInt(process.env.PORT || "9001");
const serviceName = process.env.SERVICE_NAME || "serviceB";

const tracer = trace.getTracer(serviceName);
const meter = metrics.getMeter(serviceName);

const pingInvocationsMeter = meter.createCounter('ping_invocations', {
    description: 'Number of ping invocations'
});

const app
    = new Elysia().get("/ping", ({ error }) => {
        const endpoint = "/ping";
        return tracer.startActiveSpan('/ping', (rootSpan: Span) => {
            // rootSpan.setAttribute("service.name", serviceName);
            try {
                pingInvocationsMeter.add(1, { "ping.success": true });

                logInfo({ endpoint, message: "ping invoked"});

                return new Response(JSON.stringify({message: "pong", serviceName }));
            } catch (err: any) {
                logError({endpoint, message: err.message,});

                pingInvocationsMeter.add(1, { "ping.success": false });
                rootSpan.recordException(err);
                return error(500, JSON.stringify({ message: "Something failed !!!", serviceName }));
            } finally {
                rootSpan.end();
            }
        });
    })
    .listen(port);

console.log(
    `🦊 ${serviceName} is running at ${app.server?.hostname}:${app.server?.port}`
);