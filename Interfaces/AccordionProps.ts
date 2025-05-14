import {ProductData, ProductStock} from "@/Interfaces/ProductData";

export interface AccordionProps {
    title: string;
    type: keyof ProductStock;
    data: ProductData | null;
}