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
    hasPlayed,
    player_name,
  } from "../stores";
  import { card_path } from "../model";
  import { goto } from "$app/navigation";

  let radius = 900;
  const cardWidth = 130;
  const cardHeight = cardWidth * 1.395;

  $: websocket_ready = false;
  $: yourTurn =
    $gameState !== undefined &&
    $gameState.turn % $gameState.players.length ===
      $gameState.players.findIndex((player) => player.id === player_id);
  let roomInfo: RoomInfoMessage | undefined;
  let client: Client;
  let player_id = crypto.randomUUID();

  const on_roomInfo = (roomInfoMessage: RoomInfoMessage) => {
    const player = roomInfoMessage.players.find(
      (player) => player.id === player_id
    );
    if (!player) {
      roomInfo = undefined;
      on_errorMessage({ type: "error", error_type: "join_room" });
      return;
    }
    roomInfo = roomInfoMessage;
    if ($player_name === undefined) {
      $player_name = player.name;
    }
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
      $hasPickedUp = false;
    }
  };
  const on_open = () => {
    const room = $page.url.searchParams.get("room");
    if (room) {
      client.joinRoom(room, $player_name);
    } else {
      $hasPickedUp = false;
    }
    console.log("joining room");
    websocket_ready = true;
  };

  onMount(async () => {
    window.addEventListener("beforeunload", (_) => {
      window.sessionStorage.tabId = player_id;
      window.sessionStorage.hasPickedUp = $hasPickedUp;
    });

    if (window.sessionStorage.tabId) {
      player_id = window.sessionStorage.tabId;
      window.sessionStorage.removeItem("tabId");
    }
    if (window.sessionStorage.hasPickedUp) {
      $hasPickedUp = window.sessionStorage.hasPickedUp;
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
    window.sessionStorage.hasPickedUp = true;
    $show_active_card = true;
    const card = $gameState.deck.at(-1)!;
    const intermediate = { type: "hand", index: 0 } as const;
    client.moveCard({ type: "deck" }, intermediate, card);
    $active_card = {
      card,
      offset: {
        x: $mouse.x - x,
        y: $mouse.y - y,
      },
      source: intermediate,
    };
  };
  $: console.log(`${$hasPlayed} ${$hasPickedUp}`);
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
    on:click={() => client.createRoom($player_name)}
    disabled={!websocket_ready}>Create Room</button
  >
  {#if roomInfo !== undefined}
    <Room {client} {roomInfo} {player_id} />
  {/if}
{:else}
  <div style:display="flex">
    <div>
      <div style:display="flex" style:justify-content="flex-end">
        <div style:margin-right="10px">
          <Deck
            cards={$gameState.deck}
            {cardWidth}
            {cardHeight}
            active={$active_card === undefined && yourTurn && !$hasPickedUp}
            on_click={on_click_deck}
          />
        </div>
      </div>
  {#if yourTurn}
        <div
style:position=absolute
            style:left="0"
            style:bottom="0"
            style:transform="translate(30%, -10px)"
>
    <button
          style:display="block"
          style:width="100px"
          style:height="50px"
      type="button"
      disabled={$active_card !== undefined}
      on:click={async () => await client.reset()}><i class="fas fa-undo"></i></button
    >
    <!-- <button -->
    <!--       style:display="block" -->
    <!--       style:width="100px" -->
    <!--       style:height="50px" -->
    <!--   type="button" -->
    <!--   disabled={$active_card !== undefined} -->
    <!--   on:click={() => client.sortCards(player_id)}>sort</button -->
    <!-- > -->
    </div>
        <div
style:position=absolute
            style:right="0"
            style:bottom="0"
            style:transform="translate(-30%, -10px)"
>
    <button
          style:display="block"
          style:width="100px"
          style:height="50px"
      type="button"
      disabled={$active_card !== undefined || (!$hasPlayed && !$hasPickedUp)}
      on:click={() => client.endTurn()}><i class="fa fa-check"></i></button
    >
    </div>
  {/if}
      {#each $gameState.players as player}
        {#if player.id === player_id}
          <div
            style:position="absolute"
            style:left="50%"
            style:bottom="0"
            style:transform="translate(-50%, 10%)"
          >
            <FanHand
              cards={player.hand}
              active
              {radius}
              {cardWidth}
              {cardHeight}
              {client}
            />
          </div>
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
{/if}
