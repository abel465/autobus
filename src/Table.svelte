<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";
  import type { Coord } from "./util";
  import { active_card, mouse, meldAnimationKeys, yourTurn } from "./stores";

  import { fly, crossfade } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  import HorizontalHand from "./HorizontalHand.svelte";

  export let table: Card[][];
  export let active: boolean = false;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;

  let transitionOffset: Coord | undefined;

  $: transitionDuration = $yourTurn ? 300 : 1000;

  const [send, receive] = crossfade({
    fallback(node) {
      if (transitionOffset === undefined) {
        return { duration: 0 };
      } else {
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
    },
  });
</script>

<div
  style:margin="10px"
  style:border="#2e1a12 solid 5px"
  style:background-color="#22bb00"
  style:width="100%"
  style:min-height="calc(100vh - {cardHeight}px)"
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
        if (active && $active_card) {
          const source = $active_card.source;
          client.moveCard(
            $active_card.source,
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
      {@const key = meldAnimationKeys[index]}
      <div
        style:margin="10px"
        in:receive={{ key }}
        out:send={{ key }}
        animate:flip={{ duration: transitionDuration, easing: cubicInOut }}
      >
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
