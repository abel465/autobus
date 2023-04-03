<script lang="ts">
  import Deck from "../Deck.svelte";
  import FanHand from "../FanHand.svelte";
  import Room from "../Room.svelte";
  import Client from "../client";
  import type {
    ErrorMessage,
    GameStateMessage,
    RoomInfoMessage,
  } from "../message";
  import Table from "../Table.svelte";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import {
    active_card,
    mouse,
    show_active_card,
    gameState,
    hasPickedUp,
  } from "../stores";
  import { card_path } from "../model";
  import { goto } from "$app/navigation";

  let radius = 900;
  const cardWidth = 120;
  const cardHeight = cardWidth * 1.395;

  const player_name = "abel";

  $: websocket_ready = false;
  $: yourTurn =
    $gameState !== undefined &&
    $gameState.turn % $gameState.players.length ===
      $gameState.players.findIndex((player) => player.id === player_id);
  let roomInfo: RoomInfoMessage | undefined;
  let client: Client;
  let player_id = crypto.randomUUID()

  const on_roomInfo = (roomInfoMessage: RoomInfoMessage) => {
    roomInfo = roomInfoMessage;
    $page.url.searchParams.set("room", roomInfo.room_id);
    goto(`?${$page.url.searchParams.toString()}`);
  };
  const on_gameState = (gameStateMessage: GameStateMessage) => {
    $gameState = gameStateMessage;
  };
  const on_errorMessage = (errorMessage: ErrorMessage) => {
    if (errorMessage.error_type == "join_room") {
      $page.url.searchParams.delete("room");
      goto(`?${$page.url.searchParams.toString()}`);
    }
  };
  const on_open = () => {
    const room = $page.url.searchParams.get("room")
    if (room) {
      client.joinRoom(room, player_name);
    }
    console.log("joining room");
    websocket_ready = true;
  };

  onMount(async () => {
    window.addEventListener("beforeunload", (_) => {
      window.sessionStorage.tabId = player_id;
    });

    if (window.sessionStorage.tabId) {
      player_id = window.sessionStorage.tabId;
      window.sessionStorage.removeItem("tabId");
    }

    client = new Client(
      window.clingo,
      player_id,
      on_roomInfo,
      on_gameState,
      on_errorMessage,
      on_open,
      () => {
        websocket_ready = false;
      }
    );
    document.onmousemove = (event) => {
      $mouse = { x: event.x, y: event.y };
    };
  });

  const on_click_deck = (x: number, y: number) => {
    $hasPickedUp = true;
    $show_active_card = true;
    $active_card = {
      card: $gameState.deck.pop()!,
      offset: {
        x: $mouse.x - x,
        y: $mouse.y - y,
      },
      source: { type: "deck" },
    };
  };
</script>

{#if $active_card !== undefined && $show_active_card}
  {@const coord = {
    x: $mouse.x - $active_card.offset.x,
    y: $mouse.y - $active_card.offset.y,
  }}
  <img
    alt=""
    src={card_path($active_card.card, true)}
    style:transform="translate({coord.x}px,{coord.y}px)"
    style:width="{cardWidth}px"
    style:position="absolute"
    style:pointer-events="none"
    style:z-index="99"
  />
{/if}

{#if $gameState === undefined}
  <button
    type="button"
    on:click={() => client.createRoom(player_name)}
    disabled={!websocket_ready}>Create Room</button
  >
  {#if roomInfo !== undefined}
    <Room {client} {roomInfo} />
  {/if}
{:else}
  <div style:display="flex">
    <div>
      <div style:display="flex" style:justify-content="flex-end">
        <div style:margin-right="50px">
          <Deck
            cards={$gameState.deck}
            {cardWidth}
            {cardHeight}
            active={$active_card === undefined && yourTurn && !$hasPickedUp}
            on_click={on_click_deck}
          />
        </div>
      </div>
      {#each $gameState.players as player}
        {#if player.id === player_id}
          <FanHand
            cards={player.hand}
            active
            {radius}
            {cardWidth}
            {cardHeight}
            {client}
          />
        {:else}
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
    <Table
      cardss={$gameState.table}
      active={yourTurn}
      {cardWidth}
      {cardHeight}
      {client}
    />
  </div>
  {#if yourTurn}
    <button type="button" disabled={$active_card !== undefined} on:click={() => client.endTurn()}>end turn</button>
  {/if}
{/if}

<!-- && -->
<!--    ($active_card === undefined || $active_card.source.type === "hand") -->
