import {createClient} from 'redis';
import {meter} from "serviceb/src/otel";
import {logInfo, logDebug, logError} from "../otel/logger";
import {getServiceName} from "../utils";
import type {Customer} from "../types/Customer.ts";
import {tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";

const REDIS_CONNECTION_URL = process.env.REDIS_CONNECTION_URL;

let redisClient: any;

const cache_hit_counter = meter.createCounter('cache_hit_counter', {
    description: 'Number of times item found in cache'
});

const cache_miss_counter = meter.createCounter('cache_miss_counter', {
    description: 'Number of times item NOT found in cache'
});

const cache_set_counter = meter.createCounter('cache_set_counter', {
    description: 'Number of times item was SET in cache'
});

const getClient = async () => {
    if (!redisClient) {
        redisClient = createClient({url: REDIS_CONNECTION_URL});
        await redisClient.connect();

        logInfo({message: 'Connected to Redis!!!'});

        const customerA: Customer = {
            id: 1,
            name: 'Customer A',
            orders: [{
                orderId: 1,
                lines: [{
                    productId: 1,
                    quantity: 2,
                    amount: 10
                },
                    {
                        productId: 2,
                        quantity: 1,
                        amount: 10
                    }]
            }]
        }

        const customerB: Customer = {
            id: 2,
            name: 'Customer B',
            orders: [{
                orderId: 2,
                lines: [{
                    productId: 3,
                    quantity: 2,
                    amount: 10
                },
                    {
                        productId: 4,
                        quantity: 1,
                        amount: 10
                    }]
            }]
        }

        // Bad customer with wrong products
        const customerC: Customer = {
            id: 3,
            name: 'Customer B',
            orders: [{
                orderId: 2,
                lines: [{
                    productId: 4,
                    quantity: 2,
                    amount: 10
                },
                    {
                        productId: 100,
                        quantity: 1,
                        amount: 10
                    }]
            }]
        }

        await redisClient.set('customer:1', JSON.stringify(customerA));
        await redisClient.set('customer:2', JSON.stringify(customerB));
        await redisClient.set('customer:3', JSON.stringify(customerC));
    }
    return redisClient;
};

// generate function to set item in redis with generic type
export const getItemFromRedis = async <T>(key: string): Promise<T | null> => {
    return tracer.startActiveSpan('getItemFromRedis', async (rootSpan: Span) => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        try {
            logInfo({key, message: "Getting item from cache"}, {}, traceId, spanId);

            const client = await getClient();
            const value = await client.get(key);
            if (!value) {
                logInfo({key, message: "Item not found in cache"}, {}, traceId, spanId);
                cache_miss_counter.add(1, {key, service: getServiceName()});
                return null;
            }

            logInfo({key, message: "Found item in cache"}, {}, traceId, spanId);
            cache_hit_counter.add(1, {key, service: getServiceName()});
            return JSON.parse(value) as T;
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ key, message: "Failed while looking up item in Cache", err }, {}, traceId, spanId);
            throw err;
        }
        finally {
            rootSpan.end()
        }
    });
}

export const setItemInRedis = async <T>(key: string, value: T) => {
    return tracer.startActiveSpan('setItemInRedis', async (rootSpan: Span) => {
        const traceId = rootSpan.spanContext().traceId;
        const spanId = rootSpan.spanContext().spanId;

        try {
            logInfo({key, message: "Adding item to cache"}, {}, traceId, spanId);

            const client = await getClient();
            cache_set_counter.add(1, {key, service: getServiceName()});
            await client.set(key, JSON.stringify(value));
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ key, message: "Failed while adding item in Cache", err }, {}, traceId, spanId);
            throw err;
        }
        finally {
            rootSpan.end()
        }
    });
};