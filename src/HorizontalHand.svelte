<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";
  import { card_path, getId } from "./model";
  import { cubicBezier } from "./util";
  import { bezierWithRotation } from "./transition";
  import {
    active_card,
    show_active_card,
    mouse,
    invalidMelds,
    yourTurn,
    lastMove,
    lastMovePosition,
    reset_in_progress,
    setTablePositions,
    tablePositions,
  } from "./stores";

  import { fly } from "svelte/transition";
  import { cubicInOut } from "svelte/easing";
  import { flip } from "svelte/animate";

  export let cards: Card[];
  export let hidden: boolean = false;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;
  export let index: number;

  let root: Element;
  let activeAttractorIndex: number | undefined = undefined;

  $: ids = current_cards.map((card) => getId(card));
  $: hovered = Array(cards.length + 2).fill(false);
  $: numAttractors =
    cards.length +
    ($active_card?.source.type !== "table" ||
    $active_card?.source.group_index !== index
      ? 1
      : 0);
  $: current_cards = (() => {
    const temp_cards = [...cards];
    if ($active_card) {
      if (
        $active_card.source.type === "table" &&
        $active_card.source.group_index === index
      ) {
        temp_cards.splice(cards.indexOf($active_card.card), 1);
      }
      if (activeAttractorIndex !== undefined) {
        temp_cards.splice(activeAttractorIndex, 0, $active_card.card);
      }
    }
    return temp_cards;
  })();
  $: setTablePositions[index] = () => {
    const { x, y } = root.getBoundingClientRect();
    tablePositions[index] = {
      xs: current_cards.map((_, i) => x + cardWidth * cardSpacing * i),
      y,
    };
  };
  $: interact = $yourTurn && !$active_card;

  function transitionOtherPlayers(node: Element) {
    if ($yourTurn && !reset_in_progress.value) {
      return { duration: 0 };
    } else if ($lastMove?.type === "hand") {
      const coord = lastMovePosition;
      const { x: x0, y: y0 } = root.getBoundingClientRect();
      const x = coord.x - x0 - cardWidth * cardSpacing * (cards.length - 1);
      const y = coord.y - y0;
      const sinAngle = Math.sin(coord.angle);
      const cosAngle = Math.cos(coord.angle);
      const k = 10;
      return bezierWithRotation(node, {
        duration: 1000,
        angle: coord.angle,
        easing: cubicInOut,
        bezier: cubicBezier(
          { x, y },
          { x: x - k * cosAngle, y: y + 350 + k * sinAngle },
          { x: k * cosAngle, y: y + 350 - k * sinAngle },
          { x: 0, y: 0 }
        ),
      });
    } else if ($lastMove?.type === "table") {
      const { x, y } = node.getBoundingClientRect();
      const tablePosition = tablePositions[$lastMove.group_index];
      return fly(node, {
        x: tablePosition.xs[$lastMove.card_index] - x,
        y: tablePosition.y - y,
        duration: 1000,
        opacity: 1,
        easing: cubicInOut,
      });
    }
    return { duration: 0 };
  }
</script>

<div
  bind:this={root}
  style:display="flex"
  style:width="{cardWidth *
    (1 + cardSpacing * Math.max(2, cards.length - 1))}px"
  style:height="{cardHeight * (17 / 16)}px"
>
  {#if $yourTurn && !!$active_card}
    {#each { length: numAttractors } as _, i}
      {@const powerX = 0.2}
      {@const powerY = 0.4}
      {@const x =
        cardWidth * cardSpacing * i +
        $active_card.offset.x -
        (cardWidth * powerX) / 2}
      {@const y = $active_card.offset.y - cardHeight * powerY}
      <div
        style:translate="{x}px {y}px"
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
          if (
            from.type !== "table" ||
            from.group_index !== index ||
            from.card_index !== i
          ) {
            client.moveCard(
              from,
              {
                type: "table",
                group_index: index,
                card_index: i,
                only_card: false,
              },
              $active_card.card
            );
            $invalidMelds[index] = false;
            if (from.type === "table" && from.only_card) {
              delete $invalidMelds[index];
              $invalidMelds = $invalidMelds;
            }
          }
          $active_card = undefined;
          activeAttractorIndex = undefined;
        }}
        on:keydown={undefined}
        style:z-index={`${i + 100}`}
      />
    {/each}
  {/if}
  {#each current_cards as card, i (ids[i])}
    {@const x = cardWidth * cardSpacing * i}
    <div
      in:transitionOtherPlayers
      on:introend={setTablePositions[index]}
      animate:flip={{ duration: $yourTurn ? 0 : 1000 }}
      style:translate="{i * cardSpacing * cardWidth}px"
      style:width="{cardWidth}px"
      style:position="absolute"
      style:z-index={(($lastMove?.type === "deck"
        ? 0
        : $lastMove?.card_index) || 0) + 10}
    >
      <img
        style:border-radius="5px"
        style:box-shadow={$invalidMelds[index]
          ? "0px 0px 10px 10px #ff4444"
          : "none"}
        style:padding-bottom="{hovered[i] || activeAttractorIndex === i
          ? cardHeight / 16
          : 0}px"
        style:margin-top="{hovered[i] || activeAttractorIndex === i
          ? 0
          : cardHeight / 16}px"
        alt=""
        src={card_path(card, !hidden)}
        style:width="{cardWidth}px"
        style:cursor={interact ? "pointer" : "inherit"}
        on:mouseenter={interact ? () => (hovered[i] = true) : undefined}
        on:mouseleave={interact ? () => (hovered[i] = false) : undefined}
        on:click|stopPropagation={interact
          ? () => {
              const { x: x0, y: y0 } = root.getBoundingClientRect();
              $invalidMelds[index] = false;
              hovered[i] = false;
              $show_active_card = true;
              $active_card = {
                card,
                offset: {
                  x: $mouse.x - x - x0,
                  y: $mouse.y - y0,
                },
                source: {
                  type: "table",
                  group_index: index,
                  card_index: i,
                  only_card: current_cards.length === 1,
                },
              };
            }
          : undefined}
        on:keydown={undefined}
      />
    </div>
  {/each}
</div>
