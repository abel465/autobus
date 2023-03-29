<script lang="ts">
  import type Client from "./client";
  import type { RoomInfoMessage } from "./message";
  import { page } from "$app/stores";
  export let client: Client;
  export let roomInfo: RoomInfoMessage

  function getLink() {
    navigator.clipboard.writeText($page.url.origin + "?room=" + roomInfo.room_id);
  }
</script>

<main style:margin="10px">
  <div style:display="flex">
    <div id="index-header" class="bob index" style:border-top="solid" />
    <div class="bob user name" style:border-top="solid">
      <i style:padding-right="10px" />
      <b>name</b>
    </div>
  </div>
  {#each roomInfo.players as player, i}
    <div style:display="flex">
      <div class="bob index">
        {i}
      </div>
      <div class="bob name" style:position="relative">
        {#if player.bot}
          <i style:padding-right="10px" class="fa-solid fa-robot" />
        {:else}
          <i style:padding-right="10px" />
        {/if}
        {player.name}
        <i
          class="fa-solid fa-trash-can"
          style:position="absolute"
          style:right="0"
          on:click={() => client.removePlayer(roomInfo.players[i].id)}
          on:keydown={undefined}
        />
      </div>
    </div>
  {/each}
  <button type="button" on:click={() => getLink()}>Invite Link</button>
  <button type="button" on:click={() => client.addBot()}>Add AI</button>
  <button type="button" on:click={() => client.startGame()}>Start Game</button>
</main>

<style>
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
  .index {
    width: 20px;
    text-align: center;
  }
  .name {
    width: 200px;
  }
</style>
