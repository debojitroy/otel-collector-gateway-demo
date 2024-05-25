import { Elysia } from "elysia";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import { tracer, meter } from "./otel";
import {logInfo, logError} from "./otel/logger";
import {getServiceName} from "./utils";
import {getProduct, getProductWithError, getProductWithLatency} from "./db";

const port = parseInt(process.env.PORT || "9001");
const serviceName = getServiceName();

const pingInvocationsMeter = meter.createCounter('ping_invocations', {
    description: 'Number of ping invocations'
});

const productInvocationsMeter = meter.createCounter('get_product', {
    description: 'Number of GET /customer.ts.ts invocations'
});

const app
    = new Elysia().get("/ping", ({ error, set }) => {
        const endpoint = "/ping";
        set.headers["Content-Type"] ="application/json";

        return tracer.startActiveSpan('/ping', (rootSpan: Span) => {
            try {
                pingInvocationsMeter.add(1, { "ping.success": true });

                logInfo({ endpoint, message: "ping invoked"});

                rootSpan.setStatus({ code: SpanStatusCode.OK });
                rootSpan.setAttribute("http.status", 200);
                return new Response(JSON.stringify({message: "pong", serviceName }));
            } catch (err: any) {
                logError({endpoint, message: err.message,});

                pingInvocationsMeter.add(1, { "ping.success": false });
                rootSpan.recordException(err);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });
                rootSpan.setAttribute("http.status", 500);
                return error(500, JSON.stringify({ message: "Something failed !!!", serviceName }));
            } finally {
                rootSpan.end();
            }
        });
    }).get("/product/:id", async ({ error, set, params : { id }, headers }) => {
        const endpoint = "/customer.ts.ts";
        set.headers["Content-Type"] ="application/json";

        return tracer.startActiveSpan(endpoint, async (rootSpan: Span) => {
            try {
                productInvocationsMeter.add(1, { "product_id": id });
                rootSpan.setAttribute("product_id", id);

                logInfo({ endpoint, message: "GET /customer.ts.ts invoked", id });

                const product_id = parseInt(id);

                if (isNaN(product_id)) {
                    logError({ message: "Invalid customer.ts.ts id", serviceName, id, endpoint, status: "400" });
                    rootSpan.setAttribute("http.status", 400);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(400, JSON.stringify({ message: "Invalid customer.ts.ts id", serviceName, id }));
                }

                const custom_header = headers["x-special"];

                const product = custom_header === "delay" ? await getProductWithLatency(product_id, 3000, serviceName) :
                    custom_header === "error" ? await getProductWithError(product_id, serviceName) : (await getProduct(product_id, serviceName));

                if (!product) {
                    logError({ message: "Product NOT Found", serviceName, id, endpoint, status: "404" });
                    rootSpan.setAttribute("http.status", 404);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(404, JSON.stringify({ message: "Product NOT Found", serviceName, id }));
                }

                rootSpan.setAttribute("http.status", 200);
                rootSpan.setStatus({ code: SpanStatusCode.OK });

                logInfo({ endpoint, message: "Product Found", id, product });

                return new Response(JSON.stringify({product, serviceName }));
            } catch (err: any) {
                logError({endpoint, message: err.message,});

                rootSpan.recordException(err);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });
                rootSpan.setAttribute("http.status", 500);
                return error(500, JSON.stringify({ message: "Something failed !!!", serviceName, id }));
            } finally {
                rootSpan.end();
            }
        });
    })
    .listen(port);

console.log(
    `🦊 ${serviceName} is running at ${app.server?.hostname}:${app.server?.port}`
);