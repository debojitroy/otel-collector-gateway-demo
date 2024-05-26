import {meter} from "serviceb/src/otel";
import {tracer} from "../otel";
import {type Span, SpanStatusCode} from "@opentelemetry/api";
import {logDebug, logError, logInfo} from "../otel/logger";
import type {Product} from "../types/Product.ts";
import {getProduct} from "../service/product.ts";

export enum ProductFilters {
    ALL = "all",
    NEW = "new",
    OLD = "old",
    BAD = "bad"
}

const all_products = [1, 2, 3, 4];
const new_products = [1, 2];
const old_products = [3, 4];
const bad_products = [4];

const getProductIds = (productFilter: ProductFilters) => {
    switch (productFilter) {
        case ProductFilters.ALL:
            return all_products;
        case ProductFilters.NEW:
            return new_products;
        case ProductFilters.OLD:
            return old_products;
        case ProductFilters.BAD:
            return bad_products;
    }
}

const productFilterCounter = meter.createCounter('product_filter', {
    description: 'Calls to Product Filter'
});

export const getProductsFromService = async (productFilter: ProductFilters) => {
    productFilterCounter.add(1, { filter: productFilter.toString() });
    const products: Product[] = [];

    return tracer.startActiveSpan('getProductsFromService', async (rootSpan: Span) => {
        try {
            logDebug({ filter: productFilter.toString(), message: "getProductsFromService::Looking up products"});

            await Promise.all(getProductIds(productFilter).map(async (id) => {
                const product = await getProduct(id);
                products.push(product);
            }));

            rootSpan.setStatus({code: SpanStatusCode.OK});
        } catch (err: any) {
            rootSpan.setStatus({code: SpanStatusCode.ERROR});
            rootSpan.recordException(err);

            logError({ filter: productFilter.toString(), message: "getProductsFromService::Failed get lookup products", err });
            throw err;
        } finally {
            rootSpan.end();
        }

        return products;
    });
}