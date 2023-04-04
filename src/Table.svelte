<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";

  import { active_card } from "./stores";

  import HorizontalHand from "./HorizontalHand.svelte";

  export let cardss: Card[][];
  export let active: boolean = false;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;
</script>

<div
  style:margin="10px"
  style:border="#2e1a12 solid 5px"
  style:background-color="#22bb00"
  style:width="100%"
  style:height="calc(100vh - {cardHeight}px)"
  style:cursor={active && $active_card !== undefined ? "pointer" : "default"}
  on:click={() => {
    if (active && $active_card !== undefined) {
      client.moveCard(
        $active_card.source,
        {
          type: "table",
          group_index: cardss.length,
          card_index: 0,
          only_card: true,
        },
        $active_card.card
      );
      $active_card = undefined;
    }
  }}
  on:keydown={undefined}
>
  <div style:display="flex" style:flex-wrap="wrap">
    {#each cardss as cards, index}
      <div style:margin="10px">
        <HorizontalHand
          {cards}
          {active}
          {cardWidth}
          {cardHeight}
          {cardSpacing}
          {client}
          {index}
        />
      </div>
    {/each}
  </div>
</div>

<style>
</style>
