<script lang="ts">
	import Product from '$lib/Product.svelte';
    import { getAllProducts, getAllRegions, productStore, regionStore } from '$lib/store';
	import { Grid, Row } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

    onMount(() => {
        getAllProducts();
        getAllRegions();
    })
</script>

{#if $productStore && $regionStore}
    <Grid>
        <Row>
            {#each $productStore.allProducts as product}
            <Product product={product} region={$regionStore.allRegions[0]}/>
            {/each}
        </Row>
    </Grid>
{:else}
    <p>Loading...</p>
{/if}