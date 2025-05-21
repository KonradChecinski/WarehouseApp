export interface StockItem {
    symbol: string;
    name: string;
    quantity: number;
}

export interface ProductImage {
    slug: string;
    order: number;
    main: number;
    laravel_through_key: number;
}

export interface ProductPrices {
    vat_rate: number;
    wholesale_net_price: number;
    wholesale_gross_price: number;
    retail_net_price: number;
    retail_gross_price: number;
    b2c_net_price: number;
    b2c_gross_price: number;
    currency: string;
    laravel_through_key: number;
}

export interface ProductBarcode {
    barcode: string;
    main: boolean
}

export interface ProductStock {
    suppliers: StockItem[];
    shops: StockItem[];
    other: StockItem[];
}

export interface ProductData {
    product: {
        model: {
            id: number;
            name: string;
            symbol: string;
        };
        color: {
            id: number;
            name: string;
            shortcut: string;
        };
        product: {
            symbol: string;
            name: string;
            quantity: number;
            available: number;
            size: string;
            unit: string;
            barcodes: ProductBarcode[];
        };
        images: ProductImage[];
        prices: ProductPrices;
    };
    stock: ProductStock;
}


export interface FetchDataResponse<T> {
    data?: T;
    error?: string;
    status: number;
}