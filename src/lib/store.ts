import { get, writable } from "svelte/store";
import { createClient } from "./client";
import type { Product, Region } from "@medusajs/medusa"

interface ProductStore {
    allProducts: Product[],
    currentProduct: Product | null,
};

interface RegionStore {
    allRegions: Region[],
};

const medusaClient = createClient();

export const productStore = writable<ProductStore>();
export const regionStore = writable<RegionStore>();

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

export const getAllRegions = async () => {
    const res = await medusaClient.regions.list();
    regionStore.set({
        allRegions: res.regions
    });
}