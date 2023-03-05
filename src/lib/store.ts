import { writable } from "svelte/store";
import { createClient } from "./client";
import type { Product } from "@medusajs/medusa"

interface ProductStore {
    allProducts: Product[],
    currentProduct: Product | null,
};

const medusaClient = createClient();

export const productStore = writable<ProductStore>();

export const getAllProducts = async () => {
    const res = await medusaClient.products.list();
    productStore.set({
        allProducts: res.products,
        currentProduct: null,
    });
}

export const getProduct = async (id: string) => {
    const res = await medusaClient.products.retrieve(id);
    productStore.set({
        allProducts: [],
        currentProduct: res.product,
    });
}