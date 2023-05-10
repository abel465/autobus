<script lang="ts">
  import {
    active_card,
    show_active_card,
    mouse,
    yourTurn,
    gameState,
    hasPickedUp,
    hasPlayed,
    deckCoord,
    moves,
    yourPlayerIndex,
  } from "./stores";
  import type Client from "./client";

  import Deck from "./Deck.svelte";
  import FanHand from "./FanHand.svelte";
  import OpponentHand from "./OpponentHand.svelte";
  import Table from "./Table.svelte";

  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;
  export let player_id: string;

  const radius = 900;

  $: currentPlayer =
    $gameState &&
    $gameState.players[$gameState.turn % $gameState.players.length];

  const on_click_deck = () => {
    $hasPickedUp = true;
    window.sessionStorage.hasPickedUp = true;
    const card = $gameState.deck.at(-1)!;
    const intermediate = { type: "hand", card_index: 0 } as const;
    client.moveCard({ type: "deck" }, intermediate, card);
    $show_active_card = true;
    $active_card = {
      card,
      offset: {
        x: $mouse.x - deckCoord.x,
        y: $mouse.y - deckCoord.y,
      },
      source: intermediate,
    };
  };
</script>

<div style:display="flex">
  <div>
    <div
      style:width="{cardWidth + 32}px"
      style:height="{cardHeight + 32}px"
      style:position="relative"
    >
      <div style:position="absolute" style:bottom="0" style:right="0">
        <Deck
          cards={$gameState.deck}
          {cardWidth}
          {cardHeight}
          active={!$active_card && $yourTurn && !$hasPickedUp}
          on_click={on_click_deck}
        />
      </div>
    </div>
  </div>
  <Table
    table={$gameState.table}
    active={$yourTurn}
    {cardWidth}
    {cardHeight}
    {client}
  />
</div>

{#if !$yourTurn}
  <OpponentHand
    cards={currentPlayer.hand}
    radius={1500}
    {cardWidth}
    {cardHeight}
  />
{/if}

<div
  style:position="absolute"
  style:left="50%"
  style:bottom="0"
  style:translate="-50%"
  style:z-index="1000"
  style:display="flex"
>
  {#if $yourTurn}
    <button
      style:position="relative"
      style:bottom="20px"
      style:margin-top="auto"
      style:width="100px"
      style:height="50px"
      type="button"
      disabled={!!$active_card || $moves.length === 0}
      on:click={async () => await client.reset()}
    >
      <i class="fas fa-undo" />
    </button>
  {/if}
  <div style:padding="0 80px" style:height="{cardHeight * 1.1}px">
    <FanHand
      cards={$gameState.players[$yourPlayerIndex].hand}
      active
      {radius}
      {cardWidth}
      {cardHeight}
      {client}
    />
  </div>
  {#if $yourTurn}
    <button
      style:position="relative"
      style:bottom="20px"
      style:margin-top="auto"
      style:width="100px"
      style:height="50px"
      type="button"
      disabled={!!$active_card || (!$hasPlayed && !$hasPickedUp)}
      on:click={async () => client.endTurn()}
    >
      <i class="fa fa-check" />
    </button>
  {/if}
</div>

{#if $gameState.players.length > ($yourTurn ? 1 : 2)}
  <div
    style:display="flex"
    style:flex-direction="row-reverse"
    style:position="absolute"
    style:left="0"
    style:top="0"
    style:translate="calc(-90% + 50px) {cardHeight + 20}px"
    style:z-index="1001"
  >
    <div
      id="a"
      style:font-size="48px"
      style:height="50px"
      style:width="50px"
      style:translate="0 40px"
      style:padding-left="15px"
      style:color="#553300"
    >
      <i class="fas fa-angle-right" />
    </div>
    <div id="b">
      {#each $gameState.players as player}
        {#if player.id !== player_id && player.id !== currentPlayer.id}
          <FanHand
            cards={player.hand}
            {radius}
            cardWidth={cardWidth * 0.9}
            cardHeight={cardHeight * 0.9}
            {client}
          />
        {/if}
      {/each}
    </div>
  </div>
{/if}

<style>
  #b {
    transition: all 0.5s ease-in-out;
  }
  #a:hover + #b,
  #b:hover {
    transform: translate(90%);
  }
</style>