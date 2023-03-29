<script lang="ts">
  import type { PhysicalCard } from "./model";
  import { card_path } from "./util";
  import { onMount } from "svelte";

  export let cards: PhysicalCard[];
  export let cardWidth: number;
  export let cardHeight: number;
  export let active: boolean
  export let on_click: ((x: number, y: number) => void) 

  onMount(async () => {
    const rect = div.getBoundingClientRect();
    div_coord = { x: rect.left, y: rect.top };
  });
  let div: HTMLDivElement;
  let div_coord: { x: number; y: number };
</script>

<main>
  <div
    bind:this={div}
    style:width="{cardWidth + cards.length / 10}px"
    style:height="{cardHeight + cards.length / 10}px"
  >
    {#each cards as card, i}
      {@const x = i / 10}
      {@const y = i / 10}
      {@const lastCard = i === cards.length - 1}
      <img
        alt={card.back}
        src={card_path(card.back)}
        style:transform="translate({x}px,{y}px)"
        style:width="{cardWidth}px"
        style:position="absolute"
        style:cursor={lastCard && active ? "pointer" : "default"}
        on:click={lastCard && active ? () => on_click(x + div_coord.x, y + div_coord.y) : undefined}
        on:keypress={undefined}
      />
    {/each}
  </div>
</main>
