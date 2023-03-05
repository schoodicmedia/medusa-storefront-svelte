<script lang="ts">
    import { Tile, ImageLoader } from "carbon-components-svelte";
    import type { Product, Region } from "@medusajs/medusa";
	import { transformProductPreview } from "../util";

    export let product: Product;
    export let region: Region;
    
    $: productPreview = transformProductPreview(product, region);
</script>
 
<Tile light>
     <ImageLoader src={productPreview.thumbnail || ''} style="width: 200px;"/>
    <p>{productPreview.title}</p>
    <p><strong>{productPreview.price?.original_price}</strong></p>
</Tile>