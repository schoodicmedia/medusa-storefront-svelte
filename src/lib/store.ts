import { get, writable } from "svelte/store";
import { createClient } from "./client";
import type { Product, Region, StoreGetProductsParams } from "@medusajs/medusa"

interface ProductStore {
    allProducts: Product[],
    currentProduct: Product | null,
};

interface RegionStore {
    allRegions: Region[],
};

const medusaClient = createClient();

export const productStore = writable<ProductStore>({
    allProducts: [],
    currentProduct: null
});

export const regionStore = writable<RegionStore>({
    allRegions: []
});

export const getAllProducts = async (query?: StoreGetProductsParams) => {
    const res = await medusaClient.products.list(query);
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

export const getAllRegions = async () => {
    const res = await medusaClient.regions.list();
    regionStore.set({
        allRegions: res.regions
    });
}