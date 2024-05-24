import {Pool} from "pg";
import {meter, tracer} from "../otel";
import {logInfo, logError} from "../otel/logger";
import {SpanStatusCode} from "@opentelemetry/api";
import { delay } from "../utils";

export interface Product {
    product_id: number;
    product_name: string;
    product_desc: string;
    product_price: number;
}

const pg_connection_str = process.env.PG_CONNECTION_STRING;
let pool: Pool;

const dbProductLookupCounter = meter.createCounter('db_product_lookup', {
    description: 'Number of product lookup in DB'
});

const initialize_pool = () => {
    if (pool) {
        return;
    }

    if (!pg_connection_str) {
        throw new Error("PG_CONNECTION_STRING is not defined");
    }

    pool = new Pool({ connectionString: pg_connection_str });
}

export const getProduct = async (productId: number, service: string): Promise<Product | null> => {
    dbProductLookupCounter.add(1, {productId: productId, service});

    return tracer.startActiveSpan('getProductFromDB', async (dbSpan) => {
        try {
            logInfo({ productId: productId.toString(), method: "getProduct", message: "Looking for product from DB"});
            dbSpan.setAttribute('productId', productId);
            dbSpan.setAttribute('service', service);

            initialize_pool();

            const result = await pool.query<Product>("SELECT * FROM products WHERE product_id = $1", [productId]);
            logInfo({ productId: productId.toString(), method: "getProduct", result_count: result.rows.length.toString()});

            dbSpan.setStatus({ code: SpanStatusCode.OK, message: "Results from DB"});
            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (err: any) {
            logError({ productId: productId.toString(), method: "getProduct", message: err.message});
            dbSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message})
            throw err;
        }
        finally {
            dbSpan.end();
        }
    });
}

export const getProductWithLatency = async (productId: number, delayInMs: number, service: string): Promise<Product | null> => {
    dbProductLookupCounter.add(1, {productId: productId, service});

    return tracer.startActiveSpan('getProductWithLatency', async (dbSpan) => {
        try {
            logInfo({ productId: productId.toString(), method: "getProductWithLatency", message: "Looking for product from DB"});
            dbSpan.setAttribute('productId', productId);
            dbSpan.setAttribute('service', service);

            await delay(delayInMs);

            initialize_pool();

            const result = await pool.query<Product>("SELECT * FROM products WHERE product_id = $1", [productId]);
            logInfo({ productId: productId.toString(), method: "getProductWithLatency", result_count: result.rows.length.toString()});

            return result.rows.length > 0 ? result.rows[0] : null;
        } catch (err: any) {
            logError({ productId: productId.toString(), method: "getProductWithLatency", message: err.message});
            dbSpan.setStatus({ code: SpanStatusCode.ERROR, message: err.message})
            throw err;
        }
        finally {
            dbSpan.end();
        }
    });
}

export const getProductWithError = async (productId: number, service: string): Promise<Product | null> => {
    dbProductLookupCounter.add(1, {productId: productId, service});

    return tracer.startActiveSpan('getProductWithLatency', async (dbSpan) => {
        try {
            logInfo({ productId: productId.toString(), method: "getProductWithError", message: "Looking for product from DB"});

            dbSpan.setAttribute('productId', productId);
            dbSpan.setAttribute('service', service);

            await delay(500);

            const errorMessage = "Failed to acquire DB connection";
            logError({ productId: productId.toString(), method: "getProductWithLatency", message: errorMessage});

            dbSpan.setStatus({ code: SpanStatusCode.ERROR, message: errorMessage})
            throw new Error(errorMessage);
        }
        finally {
            dbSpan.end();
        }
    });
}