<script lang="ts">
  import type { Card } from "./model";
  import { card_path } from "./model";
  import { onMount } from "svelte";

  export let cards: Card[];
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
        alt=""
        src={card_path(card, false)}
        style:transform="translate({x}px,{y}px)"
        style:width="{cardWidth}px"
        style:position="absolute"
        style:cursor={lastCard && active ? "pointer" : "inherit"}
        on:click={lastCard && active ? () => on_click(x + div_coord.x, y + div_coord.y) : undefined}
        on:keypress={undefined}
      />
    {/each}
  </div>
</main>
