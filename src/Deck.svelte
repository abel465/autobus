<script lang="ts">
  import type { Card } from "./model";
  import { card_path } from "./model";
  import { onMount } from "svelte";
  import { deckCoord } from "./stores";

  export let cards: Card[];
  export let cardWidth: number;
  export let cardHeight: number;
  export let active: boolean;
  export let on_click: () => void;

  onMount(async () => {
    const { x, y } = top_card_element.getBoundingClientRect();
    $deckCoord = { x, y };
  });
  let top_card_element: HTMLElement;

  const pxPerCard = 0.25;
</script>

<div
  style:width="{cardWidth + cards.length * pxPerCard}px"
  style:height="{cardHeight + cards.length * pxPerCard}px"
>
  {#each cards as card, i}
    {@const x = i * pxPerCard}
    {#if i === cards.length - 1}
      <img
        alt=""
        src={card_path(card, true)}
        style:translate="{x}px {x}px"
        style:width="{cardWidth}px"
        style:position="absolute"
        style:cursor={active ? "pointer" : "inherit"}
        on:click={active ? on_click : undefined}
        on:keypress={undefined}
        bind:this={top_card_element}
      />
    {:else}
      <img
        alt=""
        src={'/cards/outline.svg'}
        style:translate="{x}px {x}px"
        style:width="{cardWidth}px"
        style:position="absolute"
      />
    {/if}
  {/each}
</div>
