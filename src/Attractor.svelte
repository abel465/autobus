<script lang="ts">
  // import { onMount, onDestroy } from "svelte";

  // export let id: string;
  // export let cardWidth: number;
  // export let cardHeight: number;
  // export let cardSpacing: number;
  // export let powerX: number;
  // export let powerY: number;
  // export let angle: number = 0;
  // export let on_attract: () => void;
  // export let on_unattract: () => void;

  let div: any;
</script>

<main>
  <div
    bind:this={div}
    style:pointer-events="none"
    style:visibility=hidden
  />
</main>

<style>
</style>
