import { Elysia } from "elysia";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import { tracer, meter } from "./otel";
import {logInfo, logError} from "./otel/logger";
import {getServiceName} from "./utils";
import {getCustomersFromService} from "./controller/customer.ts";
import {getProductsFromService} from "./controller/product.ts";

const port = parseInt(process.env.PORT || "9003");
const serviceName = getServiceName();

const customerSearchMeter = meter.createCounter('search_customer', {
    description: 'Number of GET /search/customer invocations'
});

const productSearchMeter = meter.createCounter('search_product', {
    description: 'Number of GET /search/product invocations'
});

const app
    = new Elysia().get("/customer/search", async ({ error, set, query: { term}}) => {
        const endpoint = `/customer/search`;
        set.headers["Content-Type"] ="application/json";

        return tracer.startActiveSpan(endpoint, async (rootSpan: Span) => {
            const traceId = rootSpan.spanContext().traceId;
            const spanId = rootSpan.spanContext().spanId;

            try {
                customerSearchMeter.add(1, { "search_term": term });
                rootSpan.setAttribute("search_term", term!);

                logInfo({ endpoint, message: "GET /customer/search invoked", "search_term": term }, {}, traceId, spanId);

                if (!term) {
                    logError({ message: "Invalid search term provided for searching customers", serviceName, search_term: term, endpoint, status: "400" }, {}, traceId, spanId);
                    rootSpan.setAttribute("http.status", 400);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(400, JSON.stringify({ message: "Invalid search term provided", serviceName, search_term: term }));
                }

                const customers = await getCustomersFromService(term.toLowerCase());

                if (!customers || customers.length === 0) {
                    logError({ message: "No customers found", serviceName, search_term: term, endpoint, status: "404" }, {}, traceId, spanId);
                    rootSpan.setAttribute("http.status", 404);
                    rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                    return error(404, JSON.stringify({ message: "No customers found", serviceName, search_term: term }));
                }

                rootSpan.setAttribute("http.status", 200);
                rootSpan.setStatus({ code: SpanStatusCode.OK });

                logInfo({ endpoint, message: "Customers Found", search_term: term, customers }, {}, traceId, spanId);

                return new Response(JSON.stringify({customers, serviceName }));
            } catch (err: any) {
                logError({endpoint, message: err.message,}, {}, traceId, spanId);

                rootSpan.recordException(err);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });
                rootSpan.setAttribute("http.status", 500);
                return error(500, JSON.stringify({ message: "Something failed !!!", serviceName, search_term: term }));
            } finally {
                rootSpan.end();
            }
    });
}).get("/product/search", async ({ error, set, query: { term}}) => {
    const endpoint = `/product/search`;
    set.headers["Content-Type"] ="application/json";

    return tracer.startActiveSpan(endpoint, async (rootSpan: Span) => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        try {
            productSearchMeter.add(1, { "search_term": term });
            rootSpan.setAttribute("search_term", term!);

            logInfo({ endpoint, message: "GET /product/search invoked", "search_term": term }, {}, traceId, spanId);

            if (!term) {
                logError({ message: "Invalid search term provided for searching products", serviceName, search_term: term, endpoint, status: "400" }, {}, traceId, spanId);
                rootSpan.setAttribute("http.status", 400);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                return error(400, JSON.stringify({ message: "Invalid search term provided", serviceName, search_term: term }));
            }

            const products = await getProductsFromService(term.toLowerCase());

            if (!products || products.length === 0) {
                logError({ message: "No products found", serviceName, search_term: term, endpoint, status: "404" }, {}, traceId, spanId);
                rootSpan.setAttribute("http.status", 404);
                rootSpan.setStatus({ code: SpanStatusCode.ERROR });

                return error(404, JSON.stringify({ message: "No products found", serviceName, search_term: term }));
            }

            rootSpan.setAttribute("http.status", 200);
            rootSpan.setStatus({ code: SpanStatusCode.OK });

            logInfo({ endpoint, message: "Products Found", search_term: term, products }, {}, traceId, spanId);

            return new Response(JSON.stringify({products, serviceName }));
        } catch (err: any) {
            logError({endpoint, message: err.message,}, {}, traceId, spanId);

            rootSpan.recordException(err);
            rootSpan.setStatus({ code: SpanStatusCode.ERROR });
            rootSpan.setAttribute("http.status", 500);
            return error(500, JSON.stringify({ message: "Something failed !!!", serviceName, search_term: term }));
        } finally {
            rootSpan.end();
        }
    });
}).listen(port);

console.log(
    `🦊 ${serviceName} is running at ${app.server?.hostname}:${app.server?.port}`
);
