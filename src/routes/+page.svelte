<script lang="ts">
    import { getAllProducts, productStore } from '$lib/store';
	import { onMount } from 'svelte';

    onMount(() => {
        getAllProducts();
    })
</script>

{#if $productStore}
    {#each $productStore.allProducts as product}
        <img src={product.thumbnail} style:width="200px"/>
    {/each}
{:else}
    <p>Loading...</p>
{/if}