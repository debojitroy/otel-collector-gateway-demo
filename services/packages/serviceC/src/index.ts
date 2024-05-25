import { Elysia } from "elysia";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import { tracer, meter } from "./otel";
import {logInfo, logError} from "./otel/logger";
import {getServiceName} from "./utils";

const port = parseInt(process.env.PORT || "9001");
const serviceName = getServiceName();

const app
    = new Elysia().get("/ping", ({ error, set }) => {
    const endpoint = "/ping";
    set.headers["Content-Type"] ="application/json";

    return tracer.startActiveSpan('/ping', (rootSpan: Span) => {
        try {
            // pingInvocationsMeter.add(1, { "ping.success": true });
            //
            // logInfo({ endpoint, message: "ping invoked"});
            //
            // rootSpan.setStatus({ code: SpanStatusCode.OK });
            // rootSpan.setAttribute("http.status", 200);
            // return new Response(JSON.stringify({message: "pong", serviceName }));
        } catch (err: any) {
            // logError({endpoint, message: err.message,});
            //
            // pingInvocationsMeter.add(1, { "ping.success": false });
            // rootSpan.recordException(err);
            // rootSpan.setStatus({ code: SpanStatusCode.ERROR });
            // rootSpan.setAttribute("http.status", 500);
            // return error(500, JSON.stringify({ message: "Something failed !!!", serviceName }));
        } finally {
            rootSpan.end();
        }
    });
}).listen(port);

console.log(
    `🦊 ${serviceName} is running at ${app.server?.hostname}:${app.server?.port}`
);
