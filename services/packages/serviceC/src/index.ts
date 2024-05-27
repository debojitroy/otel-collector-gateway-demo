import { Elysia } from "elysia";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import { tracer, meter } from "./otel";
import {logInfo, logError} from "./otel/logger";
import {getServiceName} from "./utils";
import {getCustomerDetails} from "./controller/customer.ts";

const port = parseInt(process.env.PORT || "9001");
const serviceName = getServiceName();

const customerInvocationsMeter = meter.createCounter('get_customer', {
    description: 'Number of GET /customer/:id invocations'
});

const app
    = new Elysia().get("/customer/:id", async ({ error, set, params : { id }}) => {
        const endpoint = `/customer/${id}`;
        set.headers["Content-Type"] ="application/json";

        return tracer.startActiveSpan(endpoint, async (rootSpan: Span) => {
            const traceId = rootSpan.spanContext().traceId;
            const spanId = rootSpan.spanContext().spanId;

            try {
                customerInvocationsMeter.add(1, { "customer_id": id });
                rootSpan.setAttribute("customer_id", id);

                logInfo({ endpoint, message: "GET /customer invoked", id }, {}, traceId, spanId);

                const customer_id = parseInt(id);

                if (isNaN(customer_id)) {
                    logError({ message: "Invalid customer id", serviceName, id, endpoint, status: "400" }, {}, traceId, spanId);
                    rootSpan.setAttribute("http.status", 400);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(400, JSON.stringify({ message: "Invalid customer id", serviceName, id }));
                }

                const customer = await getCustomerDetails(customer_id);

                if (!customer) {
                    logError({ message: "Customer NOT found", serviceName, id, endpoint, status: "404" }, {}, traceId, spanId);
                    rootSpan.setAttribute("http.status", 404);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(404, JSON.stringify({ message: "Customer NOT found", serviceName, id }));
                }

                rootSpan.setAttribute("http.status", 200);
                rootSpan.setStatus({ code: SpanStatusCode.OK });

                logInfo({ endpoint, message: "Customer Found", id, customer }, {}, traceId, spanId);

                return new Response(JSON.stringify({customer, serviceName }));
            } catch (err: any) {
                logError({endpoint, message: err.message,}, {}, traceId, spanId);

                rootSpan.recordException(err);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });
                rootSpan.setAttribute("http.status", 500);
                return error(500, JSON.stringify({ message: "Something failed !!!", serviceName, id }));
            } finally {
                rootSpan.end();
            }
    });
}).listen(port);

console.log(
    `🦊 ${serviceName} is running at ${app.server?.hostname}:${app.server?.port}`
);
