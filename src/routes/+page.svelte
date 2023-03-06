<script lang="ts">
	import Product from '$lib/Product.svelte';
    import { getAllProducts, getAllRegions, productStore, regionStore } from '$lib/store';
	import type { Region } from '@medusajs/medusa';
	import { Grid, Row, SkeletonPlaceholder } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

    let defaultRegion: Region | null = null;
    $: defaultRegion;

    onMount(() => {
        getAllRegions();

        regionStore.subscribe(
            ({allRegions}) => {
                defaultRegion = allRegions[0];
                getAllProducts({region_id: defaultRegion.id});
            }
        )
    })
</script>

{#if $productStore.allProducts && defaultRegion}
    <Grid>
        <Row>
            {#each $productStore.allProducts as product}
            <Product product={product} region={defaultRegion}/>
            {/each}
        </Row>
    </Grid>
{:else}
    <Grid>
        <Row>
            {#each Array(12).fill('') as index}
                <SkeletonPlaceholder />
            {/each}
        </Row>
    </Grid>
{/if}