<script lang="ts">
  import type { ErrorMessage, GameState, RoomInfo } from "../message";
  import {
    active_card,
    mouse,
    show_active_card,
    gameState,
    hasPickedUp,
    player_name,
    yourTurn,
    yourPlayerIndex,
  } from "../stores";
  import { card_path } from "../model";
  import Client from "../client";

  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";

  import Room from "../Room.svelte";
  import Game from "../Game.svelte";

  const cardWidth = 130;
  const cardHeight = cardWidth * 1.395;

  $: websocket_ready = false;
  let roomInfo: RoomInfo | undefined;
  let client: Client;
  let player_id = crypto.randomUUID();

  const on_roomInfo = (room_info: RoomInfo) => {
    const player = room_info.players.find((player) => player.id === player_id);
    if (!player) {
      roomInfo = undefined;
      on_errorMessage({ type: "error", error_type: "join_room" });
      return;
    }
    roomInfo = room_info;
    if ($player_name === undefined) {
      $player_name = player.name;
    }
    $page.url.searchParams.set("room", roomInfo.room_id);
    goto(`?${$page.url.searchParams.toString()}`);
  };
  const on_gameState = (game_state: GameState) => {
    $gameState = game_state;
    $yourPlayerIndex = $gameState.players.findIndex(
      (player) => player.id === player_id
    );
    $yourTurn =
      $gameState.turn % $gameState.players.length === $yourPlayerIndex;
  };
  const on_errorMessage = (errorMessage: ErrorMessage) => {
    if (errorMessage.error_type === "join_room") {
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

  $: if (browser) {
    document.body.style.cursor = ($active_card && "none") || "auto";
  }
</script>

{#if $gameState}
  {#if $active_card && $show_active_card}
    {@const x = $mouse.x - $active_card.offset.x}
    {@const y = $mouse.y - $active_card.offset.y}
    <img
      alt=""
      src={card_path($active_card.card, true)}
      style:translate="{x}px {y}px"
      style:width="{cardWidth}px"
      style:position="absolute"
      style:pointer-events="none"
      style:z-index="1002"
    />
  {/if}
  <Game {cardWidth} {cardHeight} {client} {player_id} />
{:else}
  <button
    type="button"
    on:click={() => client.createRoom($player_name)}
    disabled={!websocket_ready}>Create Room</button
  >
  {#if roomInfo}
    <Room {client} {roomInfo} {player_id} />
  {/if}
{/if}
