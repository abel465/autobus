<script lang="ts">
  import type Client from "./client";
  import type { RoomInfo } from "./message";
  import { player_name } from "./stores";

  import { page } from "$app/stores";

  export let client: Client;
  export let roomInfo: RoomInfo;
  export let player_id: string;

  let invite_link_el: HTMLElement;

  function getLink() {
    navigator.clipboard.writeText(
      $page.url.origin + "?room=" + roomInfo.room_id
    );
  }
</script>

<div style:margin="10px" style:width="320px">
  <div style:display="flex" style:justify-content="space-between">
    <button
      bind:this={invite_link_el}
      type="button"
      class="button"
      style:width="100px"
      on:click={() => {
        invite_link_el.innerText = "Copied";
        setTimeout(() => {
          invite_link_el.innerText = "Invite Link";
        }, 1000);
        getLink();
      }}>Invite Link</button
    >
    <button type="button" class="button" on:click={() => client.addBot()}
      >Add &nbsp;<span class="fa-solid fa-robot" />
    </button>
    <button type="button" class="button" on:click={() => client.startGame()}
      >Start Game</button
    >
  </div>
  <div style:display="flex" style:justify-content="space-between">
    <div class="bob name" style:border-top="solid" style:border-width="2px">
      <i style:padding-right="10px" />
      <b>Players</b>
    </div>
  </div>
  {#each roomInfo.players as player, i}
    <div style:display="flex" style:justify-content="space-between">
      <div class="bob name" style:position="relative">
        {#if player.bot}
          <i style:padding-right="10px" class="fa-solid fa-robot" />
        {:else}
          <i style:padding-right="10px" />
        {/if}
        {#if player.id === player_id}
          <input
            on:change={() => {
              client.updateName($player_name, player_id);
            }}
            bind:value={$player_name}
            style:width="125px"
            style:font-size="18px"
            maxlength=12
          />
        {:else}
          {player.name}
        {/if}
        <button
          id="x"
          on:click={() => client.removePlayer(roomInfo.players[i].id)}
          on:keydown={undefined}>&#10005;</button
        >
      </div>
    </div>
  {/each}
</div>

<style>
  #x {
    position: absolute;
    right: 0;
    border: none;
    margin-right: 12px;
  }
  .button {
    border: none;
    padding: 12px 18px;
    margin: 14px 3px;
    text-align: center;
  }
  i {
    display: inline-block;
    width: 30px;
  }
  .bob {
    background-color: #ffffff;
    padding: 20px;
    border-right-style: solid;
    border-bottom: solid;
    border-width: 2px;
  }
  .bob:first-child {
    border-left-style: solid;
  }
  .name {
    width: 100%;
  }
</style>
