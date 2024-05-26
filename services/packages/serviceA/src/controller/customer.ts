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

const getCustomerIds = (customerFilter: CustomerFilters) => {
    switch (customerFilter) {
        case CustomerFilters.ALL:
            return all_customers;
        case CustomerFilters.NEW:
            return new_customers;
        case CustomerFilters.OLD:
            return old_customers;
        case CustomerFilters.BAD:
            return bad_customers;
    }
}

const customerFilterCounter = meter.createCounter('customer_filter', {
    description: 'Calls to Customer Filter'
});

export const getCustomersFromService = async (customerFilter: CustomerFilters) => {
    customerFilterCounter.add(1, { filter: customerFilter.toString() });
    const customers: CustomerDetails[] = [];

    return tracer.startActiveSpan('getCustomersFromService', async (rootSpan: Span) => {
        try {
            logDebug({ filter: customerFilter.toString(), message: "getCustomersFromService::Looking up customers"});

            await Promise.all(getCustomerIds(customerFilter).map(async (id) => {
                const customerDetails = await getCustomer(id);
                customers.push(customerDetails);
            }));

            rootSpan.setStatus({code: SpanStatusCode.OK});
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ filter: customerFilter.toString(), message: "getCustomersFromService::Failed get lookup customers", err });
            throw err;
        } finally {
            rootSpan.end();
        }

        return customers;
    });
}