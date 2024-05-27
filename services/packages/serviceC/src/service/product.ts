import axios from "axios";
import {meter, tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import {getProductServiceUrl} from "../utils";
import {logError, logInfo} from "../otel/logger";
import type {Product} from "../types/Product.ts";

const getRandomProductHeader = () => {
    const headers = ["normal", "delay", "error"];

    const index = Math.round(10000);

    return headers[index % 3];
}
const productServiceLookupCounter = meter.createCounter('product_service_lookup', {
    description: 'Number of product lookup from Service B'
});

export const getProduct = async (productId: number) => {
    productServiceLookupCounter.add(1);
    const endpoint = `${getProductServiceUrl()}/product/${productId}`;

    return tracer.startActiveSpan(endpoint, async (rootSpan: Span): Promise<Product> => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        logInfo({ productId, endpoint, message: "Calling Service B to get product details" }, {}, traceId, spanId);

        const randomHeader = getRandomProductHeader();
        rootSpan.setAttribute("http.url", endpoint);
        rootSpan.setAttribute("http.method", "GET");
        rootSpan.setAttribute("product_id", productId);
        rootSpan.setAttribute("x-special", randomHeader);

        try {
            logInfo({ productId, endpoint, header: randomHeader, message: "Adding x-special header" }, {}, traceId, spanId);

            const response = await axios.get<Product>(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                    "x-special": randomHeader,
                }
            });

            rootSpan.setStatus({ code: SpanStatusCode.OK });
            logInfo({ productId, endpoint, header: randomHeader, message: "Received product details from Service B" }, {}, traceId, spanId);
            return response.data;
        } catch (e: any) {
            rootSpan.setStatus({ code: SpanStatusCode.ERROR });
            rootSpan.recordException(e);
            logError({productId, endpoint, header: randomHeader, message: "Failed to get product details from Service B", e }, {}, traceId, spanId);

            throw e;
        } finally {
            rootSpan.end();
        }
    });
};