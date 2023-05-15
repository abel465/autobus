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
    <div
      style:padding="10px 0px 0px 20px"
      style:text-align="center"
      class="text-shadow"
    >
      {#if $yourTurn}
        your<br />turn
      {:else}
        {#if currentPlayer.bot}
          <span class="fa-solid fa-robot" />
        {/if}
        {currentPlayer.name}'s<br />turn
      {/if}
    </div>
  </div>
  <Table table={$gameState.table} {cardWidth} {cardHeight} {client} />
</div>

{#if !$yourTurn}
  {#key currentPlayer.id}
    <OpponentHand
      cards={currentPlayer.hand}
      radius={1500}
      {cardWidth}
      {cardHeight}
    />
  {/key}
{/if}

<div
  style:position="absolute"
  style:left="50%"
  style:bottom="0"
  style:translate="-50%"
  style:z-index="1000"
  style:display="flex"
  style:width="100%"
  style:justify-content="space-evenly"
  style:pointer-events="none"
>
  {#if $yourTurn}
    <button
      style:pointer-events="auto"
      style:position="relative"
      style:bottom="20px"
      style:margin-top="auto"
      style:width="100px"
      style:height="50px"
      style:border="none"
      type="button"
      disabled={!!$active_card || $moves.length === 0}
      on:click={async () => await client.reset()}
    >
      <i class="fas fa-undo" />
    </button>
  {/if}
  <div style:height="{cardHeight * 1.1}px">
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
      style:pointer-events="auto"
      style:position="relative"
      style:bottom="20px"
      style:margin-top="auto"
      style:width="100px"
      style:height="50px"
      style:border="none"
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
    style:justify-content="center"
    style:position="absolute"
    style:left="0"
    style:top="0"
    style:translate="calc(0% + 50px) {cardHeight + 100}px"
    style:z-index="1001"
  >
    <div id="b" style:width="fit-content" style:background-color="red">
      {#each $gameState.players.filter(({ id }) => id !== player_id && id !== currentPlayer.id) as player, i}
        <div
          class="b"
          style:position="absolute"
          style:right="0"
          style:translate="0 {i * cardHeight * 0.3}px"
          style:display="flex"
        >
          <div>
            <FanHand
              cards={player.hand}
              {radius}
              cardWidth={cardWidth * 0.9}
              cardHeight={cardHeight * 0.9}
              {client}
            />
          </div>
          <div
            class="player-label text-shadow"
            style:right="-{(player.name.length + (player.bot ? 3 : 0)) * 6}px"
          >
            {#if player.bot}
              <span class="fa-solid fa-robot" />
            {/if}
            {player.name}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .b {
    transition: all 0.3s ease-in-out;
  }
  .b:hover {
    transform: translate(calc(85%));
  }
  .b:hover > .player-label {
    opacity: 1;
  }
  .text-shadow {
    text-shadow: 0 0 10px #fff, 0 0 10px #fff, 0 0 10px #fff;
  }
  .player-label {
    transition: opacity 0.3s ease-in-out;
    opacity: 0;
    position: absolute;
  }
</style>
