<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";
  import type { Coord } from "./util";
  import { active_card, mouse, meldAnimationKeys, yourTurn } from "./stores";

  import { fly } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  import HorizontalHand from "./HorizontalHand.svelte";

  export let table: Card[][];
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;

  let transitionOffset: Coord | undefined;

  $: transitionDuration = $yourTurn ? 300 : 1000;

  function transition(node: Element) {
    if (!transitionOffset) {
      return { duration: 0 };
    }
    const { x, y } = node.getBoundingClientRect();
    const params = {
      opacity: 1,
      easing: cubicInOut,
      duration: transitionDuration,
      x: $mouse.x - x - transitionOffset.x,
      y: $mouse.y - y - transitionOffset.y,
    };
    transitionOffset = undefined;
    return fly(node, params);
  }
</script>

<div
  style:margin="10px"
  style:border="#2e1a12 solid 5px"
  style:background-color="#22bb00"
  style:width="100%"
  style:min-height="max(calc(100vh - {cardHeight}px), {cardHeight + 20}px)"
  style:position="relative"
>
  {#if $active_card}
    {@const x = $active_card.offset.x - 4}
    {@const y = $active_card.offset.y - 4}
    <div
      style:position="absolute"
      style:height="calc(100% + {8 - cardHeight}px)"
      style:width="calc(100% + {8 - cardWidth}px)"
      style:translate="{x}px {y}px"
      on:click={() => {
        if ($yourTurn && $active_card) {
          const source = $active_card.source;
          client.moveCard(
            source,
            {
              type: "table",
              group_index:
                source.type === "table" && source.only_card
                  ? table.length - 1
                  : table.length,
              card_index: 0,
              only_card: true,
            },
            $active_card.card
          );
          transitionOffset = $active_card.offset;
          $active_card = undefined;
        }
      }}
      on:keydown={undefined}
    />
  {/if}
  <div style:display="flex" style:flex-wrap="wrap">
    {#each table as cards, index (meldAnimationKeys[index])}
      <div
        style:margin="10px"
        in:transition
        animate:flip={{ duration: transitionDuration, easing: cubicInOut }}
      >
        <HorizontalHand
          {cards}
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
