export interface Order {
    orderId: number;
    lines: {
        productId: number;
        quantity: number;
        amount: number
    }[]
}

export interface Customer {
	id: number;
	name: string;
    orders: Order[];
}