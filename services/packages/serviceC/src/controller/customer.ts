import type {CustomerDetails} from "../types/reponses/CustomerDetails";
import {meter} from "serviceb/src/otel";
import {tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import {logDebug, logError, logInfo} from "../otel/logger";
import {getItemFromRedis, setItemInRedis} from "../redis";
import type {Customer} from "../types/Customer.ts";
import type {Product} from "../types/Product.ts";
import {getProduct} from "../service/product.ts";

const customer_lookup_counter = meter.createCounter('customer_lookup_counter', {
    description: 'Number of times customer lookup was called'
});

const productDetailsLookup = async (productId: number, traceId: string, spanId: string) => {
    const productKey = `product:${productId}`;

    let product: Product | null = await getItemFromRedis(productKey);

    if (product) {
        logInfo({ productId, message: `Product ${productId} found in cache`}, {}, traceId, spanId);
        return product;
    }

    logInfo({ productId, message: `Product ${productId} not found in cache`}, {}, traceId, spanId);
    product = await getProduct(productId);

    logInfo({ productId, message: `Product ${productId} retrieved from API`}, {}, traceId, spanId);
    await setItemInRedis(productKey, product);

    return product
}

export const getCustomerDetails = async (customerId: number): Promise<CustomerDetails | null | undefined> => {
    customer_lookup_counter.add(1, { customer_id: customerId });

    return tracer.startActiveSpan('getCustomerDetails', async (rootSpan: Span) => {
        let customerDetails: CustomerDetails | null | undefined = null;
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        try {
            logInfo({ customerId, message: "getCustomerDetails::Looking up customer details"}, {}, traceId, spanId);
            const customer = await getItemFromRedis<Customer>(`customer:${customerId}`);

            if (!customer) {
                logError({ customerId, message: "getCustomerDetails::Customer NOT found"}, {}, traceId, spanId);
                return customerDetails;
            }

            logInfo({ customerId, message: "getCustomerDetails::Customer found in cache"}, {}, traceId, spanId);

            customerDetails = {
                id: customer.id,
                name: customer.name,
                orders: [],
            }

            logInfo({ customerId, message: "getCustomerDetails::Looking up product details"}, {}, traceId, spanId);

            const productMap = new Map<number, Product | null>();

            customer.orders.forEach((order) => {
                order.lines.forEach(line => {
                    productMap.set(line.productId, null);
                })
            });

            for (const key of productMap.keys()) {
                const product = await productDetailsLookup(key, traceId, spanId);
                productMap.set(key, product);
            }

            logInfo({ customerId, message: "getCustomerDetails::Completing Customer Order Details"}, {}, traceId, spanId);

            customer.orders.forEach((order) => {
                const orderItem = {
                    orderId: order.orderId,
                    lines: order.lines.map(line => ({
                        product: productMap.get(line.productId),
                        quantity: line.quantity,
                        amount: line.amount,
                    }))
                };
                customerDetails?.orders.push(orderItem);
            });

            rootSpan.setStatus({code: SpanStatusCode.OK});
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ customerId, message: "Failed get customer details", err }, {}, traceId, spanId);
            throw err;
        } finally {
            rootSpan.end();
        }

        return customerDetails;
    });
}