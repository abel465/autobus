<script lang="ts">
  import type { PhysicalCard } from "./model";
  import HorizontalHand from "./HorizontalHand.svelte";
  import { active_card, show_active_card } from "./stores";
  import type Client from "./client";
  import { card_path } from "./util";

  export let cardss: PhysicalCard[][];
  export let active: boolean = false;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;

  let active_attractor_index: number | undefined = undefined;

  let cardss2 = [...cardss];
  $: {
    cardss2 = [...cardss];
  }
</script>

<main
  style:display="flex"
  style:flex-wrap="wrap"
  style:padding="5px"
  style:padding-left="5px"
  style:background-color="#bbff55"
  style:--padding="50px"
>
  {#each cardss as cards, index}
    <div style:padding="var(--padding)">
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
  {#if active && $active_card !== undefined}
    {@const card = $active_card}
    {@const powerX = 0.5}
    {@const powerY = 0.5}
    <div style:position="relative" style:padding="var(--padding)">
      {#if active_attractor_index === cardss2.length}
        <img
          alt=""
          style:width="{cardWidth}px"
          style:height="{cardHeight}px"
          src={card_path($active_card.card.front)}
        />
      {:else}
        <div
          style:display=inline-block
          style:border-radius="5px"
          style:box-shadow="0px 0px 0px 1px #ffffff inset"
          style:background-color="#fefefe"
          style:width="{cardWidth}px"
          style:height="{cardHeight}px"
        />
      {/if}
      <div
        style:position="absolute"
        style:transform="translate({$active_card.offset.x -
          cardWidth * powerX}px,{$active_card.offset.y -
          cardHeight -
          cardHeight * powerY}px)"
        style:cursor="pointer"
        style:width="{cardWidth * powerX * 2}px"
        style:height="{cardHeight * powerY * 2}px"
        style:background-color="#ffff00"
        on:mouseenter={() => {
          active_attractor_index = cardss2.length;
          $show_active_card = false;
        }}
        on:mouseleave={() => {
          active_attractor_index = undefined;
          $show_active_card = true;
        }}
        on:click={() => {
          client.moveCard(
            card.source,
            { type: "table", group_index: cardss.length, card_index: 0 },
            card.card
          );
          $active_card = undefined;
          active_attractor_index = undefined;
        }}
        on:keydown={undefined}
      />
    </div>
  {/if}
</main>

<style>
</style>
