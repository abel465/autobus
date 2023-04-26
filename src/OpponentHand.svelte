<script lang="ts">
  import type { Card } from "./model";
  import { card_path, getId } from "./model";
  import {
    getOpponentHandTransitionCoord,
    deckCoord,
    lastMove,
  } from "./stores";
  import { fly } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { cubicInOut } from "svelte/easing";
  import { flyWithRotation } from "./transition";

  export let cards: Card[];
  export let radius: number = 1000;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;

  type Coord = {
    x: number;
    y: number;
    angle: number;
  };

  type Box = {
    width: number;
    height: number;
  };

  function calculateCoords(
    numCards: number,
    arcRadius: number
  ): [Coord[], Box] {
    // The separation between the cards, in terms of rotation around the circle's origin
    const anglePerCard = Math.atan((cardWidth * cardSpacing) / arcRadius);
    const startAngle = -0.5 * (Math.PI + anglePerCard * (numCards - 1));

    let minX = 99999;
    let minY = 99999;
    const coords = Array.from({ length: numCards }, (_, i) => {
      const angle = startAngle + anglePerCard * i;
      const x = -Math.cos(angle) * arcRadius;
      const y = -Math.sin(angle) * arcRadius;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);

      return { x, y, angle: angle + Math.PI / 2 };
    });

    const firstAngle = coords[0].angle;
    const cosFirstAngle = Math.cos(firstAngle);
    const sinFirstAngle = Math.sin(firstAngle);

    const rotationOffsetX =
      cosFirstAngle * cardWidth - sinFirstAngle * cardHeight;
    const rotationOffsetY =
      cosFirstAngle * cardHeight - sinFirstAngle * cardWidth;

    const offsetX = (rotationOffsetX - cardWidth) / 2 - minX;

    for (const coord of coords) {
      coord.x += offsetX;
      coord.y -= minY;
    }

    return [
      coords,
      {
        width: coords[0].x + (cardWidth + rotationOffsetX) / 2,
        height: rotationOffsetY,
      },
    ];
  }

  $: numCards = cards.length;
  $: [coords, box] = calculateCoords(numCards, radius);
  $: ids = cards.map((card) => getId(card));
  $: $getOpponentHandTransitionCoord = (index: number) => {
    const rect = root.getBoundingClientRect();
    const { x, y, angle } = coords[index];
    return {
      x: x + rect.left,
      y: y + rect.top - cardHeight / 16,
      angle,
    };
  };
  let root: HTMLElement;

  function transition(node: Element, i: number) {
    const rootRect = root.getBoundingClientRect();
    if ($lastMove?.type === "deck") {
      return flyWithRotation(node, {
        angle: -coords[i].angle,
        x: -coords[i].x - rootRect.x + $deckCoord.x,
        y: -rootRect.y + $deckCoord.y,
        duration: 1000,
      });
    }
    return { duration: 0 };
  }
</script>

<div
  bind:this={root}
  style:position="absolute"
  style:width="{box.width}px"
  style:height="{box.height}px"
  style:left="calc(50% - {cardWidth * 2}px)"
  style:top="-{(cardHeight * 6) / 7}px"
  transition:fly={{ y: -cardHeight, duration: 600 }}
>
  {#each cards as card, i (ids[i])}
    <img
      alt=""
      src={card_path(card, false)}
      style:position="absolute"
      style:width="{cardWidth}px"
      style:translate="{coords[i].x}px {coords[i].y}px"
      style:rotate="{coords[i].angle}rad"
      style:z-index={i + 10}
      in:transition={i}
      animate:flip={{ delay: 500, duration: 900, easing: cubicInOut }}
    />
  {/each}
</div>
