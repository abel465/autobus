<script lang="ts">
  import type { Card } from "./model";
  import type { CoordWithAngle } from "./util";
  import type Client from "./client";
  import { card_path, getId } from "./model";
  import {
    active_card,
    show_active_card,
    mouse,
    lastMove,
    tablePositions,
  } from "./stores";
  import { flyWithRotation } from "./transition";
  import { animateOwnHand } from "./animate";

  export let cards: Card[];
  export let active: boolean = false;
  export let radius: number = 1000;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;

  let root: Element;
  let activeAttractorIndex: number | undefined = undefined;

  $: numCards = cards.length;
  $: hovered = Array(numCards).fill(false);
  $: [coords, box] = calculateCoords(radius, numCards);
  $: ids = cards.map((card) => getId(card));
  $: current_cards = (() => {
    const temp_cards = [...cards];
    if (active && $active_card) {
      if ($active_card.source.type === "hand") {
        temp_cards.splice(cards.indexOf($active_card.card), 1);
      }
      if (activeAttractorIndex !== undefined) {
        temp_cards.splice(activeAttractorIndex, 0, $active_card.card);
      }
    }
    return temp_cards;
  })();
  $: numAttractors = numCards + ($active_card?.source.type === "deck" ? 1 : 0);
  $: interact = active && !$active_card;

  type CoordData = CoordWithAngle & {
    xHover: number;
    yHover: number;
  };

  type Box = {
    width: number;
    height: number;
  };

  function calculateCoords(
    arcRadius: number,
    numCards: number
  ): [CoordData[], Box] {
    // The separation between the cards, in terms of rotation around the circle's origin
    const anglePerCard = Math.atan((cardWidth * cardSpacing) / arcRadius);
    const startAngle = -0.5 * (Math.PI + anglePerCard * (numCards - 1));

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
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

  function transition(node: Element, { x, y, angle }: CoordWithAngle) {
    if ($lastMove?.type === "table" && !$active_card) {
      const { x: x0, y: y0 } = root.getBoundingClientRect();
      const tablePosition = tablePositions[$lastMove.group_index];
      return flyWithRotation(node, {
        angle: -angle,
        x: tablePosition.xs[$lastMove.card_index] - x - x0,
        y: tablePosition.y - y - y0 + cardHeight / 16,
        duration: 1000,
      });
    }
    return { duration: 0 };
  }
</script>

<div bind:this={root} style:width="{box.width}px" style:height="{box.height}px">
  {#if $active_card && $active_card.source.type !== "table" && active}
    {#each { length: numAttractors } as _, i}
      {@const powerX = 0.2}
      {@const powerY = 0.4}
      {@const x =
        coords[i].x + $active_card.offset.x - (cardWidth * powerX) / 2}
      {@const y = coords[i].y + $active_card.offset.y - cardHeight * powerY}
      <div
        style:pointer-events="auto"
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
        style:z-index={i + 1}
      />
    {/each}
  {/if}
  {#each current_cards as card, i (ids[i])}
    {@const { x, y, angle } = coords[i]}
    {@const { xHover, yHover } =
      hovered[i] || activeAttractorIndex === i
        ? coords[i]
        : { xHover: 0, yHover: 0 }}
    <div
      style:width="{cardWidth}px"
      style:translate="{x}px {y}px"
      style:rotate="{angle}rad"
      animate:animateOwnHand={{ i, fromCoord: coords[i] }}
    >
      <img
        style:pointer-events="auto"
        alt=""
        src={card_path(card, active)}
        style:translate="{xHover}px {yHover}px"
        style:width="{cardWidth}px"
        style:position="absolute"
        style:padding-bottom="{hovered[i] ? cardHeight / 16 : 0}px"
        style:cursor={interact ? "pointer" : "inherit"}
        on:mouseenter={interact ? () => (hovered[i] = true) : undefined}
        on:mouseleave={interact ? () => (hovered[i] = false) : undefined}
        on:click={interact
          ? () => {
              const { x: x0, y: y0 } = root.getBoundingClientRect();
              hovered[i] = false;
              $active_card = {
                card,
                offset: {
                  x: $mouse.x - x - xHover - x0,
                  y: $mouse.y - y - yHover - y0,
                },
                source: { type: "hand", card_index: i },
              };
              $show_active_card = true;
            }
          : undefined}
        on:keydown={undefined}
        in:transition={coords[i]}
        draggable="false"
      />
    </div>
  {/each}
</div>
