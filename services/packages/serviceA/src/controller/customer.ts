import {meter} from "serviceb/src/otel";
import {tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import {logDebug, logError, logInfo} from "../otel/logger";
import type {CustomerDetails} from "../types/CustomerDetails.ts";
import {getCustomer} from "../service/customer.ts";

export enum CustomerFilters {
    ALL = "all",
    NEW = "new",
    OLD = "old",
    BAD = "bad"
}

const all_customers = [1, 2];
const new_customers = [2];
const old_customers = [1];
const bad_customers = [3];

const getCustomerIds = (customerFilter: string) => {
    if (customerFilter === CustomerFilters.ALL) {
        return all_customers;
    } else if (customerFilter === CustomerFilters.NEW) {
        return new_customers;
    } else if (customerFilter === CustomerFilters.OLD) {
        return old_customers;
    } else if (customerFilter === CustomerFilters.BAD) {
        return bad_customers;
    } else {
        return [];
    }
}

const customerFilterCounter = meter.createCounter('customer_filter', {
    description: 'Calls to Customer Filter'
});

export const getCustomersFromService = async (customerFilter: string) => {
    customerFilterCounter.add(1, { filter: customerFilter.toString() });
    const customers: CustomerDetails[] = [];

    return tracer.startActiveSpan('getCustomersFromService', async (rootSpan: Span) => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        try {
            logInfo({ filter: customerFilter.toString(), message: "getCustomersFromService::Looking up customers"}, {}, traceId, spanId);

            for (const customerId of getCustomerIds(customerFilter)) {
                const customerDetails = await getCustomer(customerId);
                customers.push(customerDetails);
            }

            rootSpan.setStatus({code: SpanStatusCode.OK});
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ filter: customerFilter.toString(), message: "getCustomersFromService::Failed get lookup customers", err }, {}, traceId, spanId);
            throw err;
        } finally {
            rootSpan.end();
        }

        return customers;
    });
}