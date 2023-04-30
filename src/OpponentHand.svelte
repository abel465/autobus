<script lang="ts">
  import type { Card } from "./model";
  import type { CoordWithAngle } from "./util";
  import { card_path, getId } from "./model";
  import {
    getOpponentHandTransitionCoord,
    deckCoord,
    lastMove,
    tablePositions,
  } from "./stores";
  import { animateOpponentHand } from "./animate";
  import { flyWithRotation } from "./transition";

  import { fly } from "svelte/transition";

  export let cards: Card[];
  export let radius: number = 1000;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;

  let root: Element;

  $: numCards = cards.length;
  $: [coords, box] = calculateCoords(radius);
  $: ids = cards.map((card) => getId(card));
  $: $getOpponentHandTransitionCoord = (index: number) => {
    const { x: x0, y: y0 } = root.getBoundingClientRect();
    const { x, y, angle } = coords[index];
    return {
      x: x + x0,
      y: y + y0 - cardHeight / 16,
      angle,
    };
  };

  type Box = {
    width: number;
    height: number;
  };

  function calculateCoords(arcRadius: number): [CoordWithAngle[], Box] {
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

  function transition(node: Element, i: number) {
    const { x: x0, y: y0 } = root.getBoundingClientRect();
    if ($lastMove?.type === "deck") {
      return flyWithRotation(node, {
        angle: -coords[i].angle,
        x: -coords[i].x - x0 + deckCoord.x,
        y: -y0 + deckCoord.y,
        duration: 1000,
      });
    } else if ($lastMove?.type === "table") {
      return flyWithRotation(node, {
        angle: -coords[i].angle,
        x:
          -coords[i].x -
          x0 +
          tablePositions[$lastMove.group_id].xs[$lastMove.card_index],
        y: -y0 + tablePositions[$lastMove.group_id].y,
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
      animate:animateOpponentHand={{ i, fromCoord: coords[i] }}
    />
  {/each}
</div>
