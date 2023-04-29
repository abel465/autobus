<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";
  import { card_path } from "./model";
  import { active_card, show_active_card, mouse } from "./stores";

  export let cards: Card[];
  export let active: boolean = false;
  export let radius: number = 1000;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;

  interface Coord {
    x: number;
    y: number;
    angle: number;
    xHover: number;
    yHover: number;
  }

  interface Box {
    width: number;
    height: number;
  }

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
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const x = cosAngle * arcRadius;
      const y = sinAngle * arcRadius;
      const xHover = (cosAngle * cardHeight) / 16;
      const yHover = (sinAngle * cardHeight) / 16;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);

      return { x, y, xHover, yHover, angle: angle + Math.PI / 2 };
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
        width: coords.at(-1)!.x + (cardWidth + rotationOffsetX) / 2,
        height: coords[0].y + (cardHeight + rotationOffsetY) / 2,
      },
    ];
  }

  $: hovered = Array(cards.length).fill(false);
  $: [coords, box] = calculateCoords(cards.length, radius);

  function getFanCoord() {
    const rect = fan.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }

  let fan: HTMLDivElement;
  let activeAttractorIndex: number | undefined = undefined;

  let cards2 = [...cards];
  $: {
    cards2 = [...cards];
    if (active && $active_card !== undefined) {
      if ($active_card.source.type === "hand") {
        cards2.splice(cards.indexOf($active_card.card), 1);
      }
      if (activeAttractorIndex !== undefined) {
        cards2.splice(activeAttractorIndex, 0, $active_card.card);
      }
    }
  }
  $: numAttractors =
    cards.length + ($active_card?.source.type === "deck" ? 1 : 0);
</script>

<div
  bind:this={fan}
  class="fan-hand"
  style:width="{box.width}px"
  style:height="{box.height}px"
>
  {#if $active_card !== undefined && $active_card.source.type !== "table" && active}
    {#each { length: numAttractors } as _, i}
      {@const powerX = 0.2}
      {@const powerY = 0.4}
      {@const x =
        coords[i].x + $active_card.offset.x - (cardWidth * powerX) / 2}
      {@const y = coords[i].y + $active_card.offset.y - cardHeight * powerY}
      <div
        style:translate="{x}px {y}px"
        style:rotate="{coords[i].angle}rad"
        style:position="absolute"
        style:width="{cardWidth * powerX * 2}px"
        style:height="{cardHeight * powerY * 2}px"
        on:mouseenter={() => {
          activeAttractorIndex = i;
          $show_active_card = false;
        }}
        on:mouseleave={() => {
          activeAttractorIndex = undefined;
          $show_active_card = true;
        }}
        on:click={() => {
          if ($active_card === undefined) {
            return;
          }
          const from = $active_card.source;
          if (from.type !== "hand" || from.card_index !== i) {
            client.moveCard(
              $active_card.source,
              { type: "hand", card_index: i },
              $active_card.card
            );
          }
          $active_card = undefined;
          activeAttractorIndex = undefined;
        }}
        on:keydown={undefined}
        style:z-index={i}
      />
    {/each}
  {/if}
  {#each cards2 as card, i}
    {@const x =
      coords[i].x +
      (hovered[i] || activeAttractorIndex === i ? coords[i].xHover : 0)}
    {@const y =
      coords[i].y +
      (hovered[i] || activeAttractorIndex === i ? coords[i].yHover : 0)}
    <img
      alt=""
      src={card_path(card, active)}
      style:translate="{x}px {y}px"
      style:rotate="{coords[i].angle}rad"
      style:width="{cardWidth}px"
      style:position="absolute"
      style:padding-bottom="{hovered[i] ? cardHeight / 16 : 0}px"
      style:cursor={active && $active_card === undefined
        ? "pointer"
        : "inherit"}
      on:mouseenter={!active || $active_card !== undefined
        ? undefined
        : () => (hovered[i] = true)}
      on:mouseleave={!active || $active_card !== undefined
        ? undefined
        : () => (hovered[i] = false)}
      on:click={!active || $active_card !== undefined
        ? undefined
        : () => {
            const fan_coord = getFanCoord();
            hovered[i] = false;
            $active_card = {
              card,
              offset: {
                x: $mouse.x - x - fan_coord.x,
                y: $mouse.y - y - fan_coord.y,
              },
              source: { type: "hand", card_index: i },
            };
            $show_active_card = true;
          }}
      on:keydown={undefined}
    />
  {/each}
</div>
