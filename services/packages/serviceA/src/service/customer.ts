import axios from "axios";
import {meter, tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import {getCustomerServiceUrl, getProductServiceUrl} from "../utils";
import {logError, logInfo} from "../otel/logger";
import type {CustomerDetails} from "../types/CustomerDetails.ts";
import type {Product} from "../types/Product.ts";

const customerServiceLookupCounter = meter.createCounter('customer_service_lookup', {
    description: 'Number of customers lookup from Service C'
});

export const getCustomer = async (customerId: number) => {
    customerServiceLookupCounter.add(1);
    const endpoint = `${getCustomerServiceUrl()}/customer/${customerId}`;

    return tracer.startActiveSpan(endpoint, async (rootSpan: Span): Promise<CustomerDetails> => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        logInfo({ customerId, endpoint, message: "Calling Service C to get customer details" }, {} ,traceId, spanId);

        rootSpan.setAttribute("http.url", endpoint);
        rootSpan.setAttribute("http.method", "GET");
        rootSpan.setAttribute("customer_id", customerId);

        try {
            const response = await axios.get<CustomerDetails>(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                }
            });

            rootSpan.setStatus({ code: SpanStatusCode.OK });
            logInfo({ customerId, endpoint, message: "Received customer details from Service C" }, {} ,traceId, spanId);
            return response.data;
        } catch (e: any) {
            rootSpan.setStatus({ code: SpanStatusCode.ERROR });
            rootSpan.recordException(e);
            logError({customerId, endpoint, message: "Failed to get customer details from Service C", e }, {} ,traceId, spanId);

            throw e;
        } finally {
            rootSpan.end();
        }
    });
};