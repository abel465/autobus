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
  style:min-height="calc(100vh - {cardHeight}px)"
  style:position="relative"
>
  {#if $active_card !== undefined}
    {@const x = $active_card.offset.x - 4}
    {@const y = $active_card.offset.y - 4}
    <div
      style:position="absolute"
      style:height="calc(100% + {8 - cardHeight}px)"
      style:width="calc(100% + {8 - cardWidth}px)"
      style:transform="translate({x}px,{y}px)"
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
    />
  {/if}
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
