import type {Product} from "../Product.ts";

export interface CustomerDetails {
    id: number;
    name: string;
    orders: {
        orderId: number;
        lines: {
            product: Product | null | undefined;
            quantity: number;
            amount: number
        }[]
    }[]
}