<script lang="ts">
  import type { Card } from "./model";
  import type Client from "./client";
  import { card_path } from "./model";
  import { active_card, show_active_card, mouse, invalidMelds } from "./stores";

  export let cards: Card[];
  export let active: boolean = false;
  export let hidden: boolean = false;
  export let cardSpacing: number = 0.2;
  export let cardWidth: number;
  export let cardHeight: number;
  export let client: Client;
  export let index: number;

  let activeAttractorIndex: number | undefined = undefined;
  $: hovered = Array(cards.length + 2).fill(false);
  $: numAttractors =
    cards.length +
    ($active_card?.source.type !== "table" ||
    $active_card?.source.group_index !== index
      ? 1
      : 0);
  let cards2 = [...cards];
  $: {
    cards2 = [...cards];
    if ($active_card !== undefined) {
      if (
        $active_card.source.type == "table" &&
        $active_card.source.group_index === index
      ) {
        cards2.splice(cards.indexOf($active_card.card), 1);
      }
      if (activeAttractorIndex !== undefined) {
        cards2.splice(activeAttractorIndex, 0, $active_card.card);
      }
    }
  }
  let div: HTMLDivElement;
  function getDivCoord() {
    const rect = div.getBoundingClientRect();
    return { x: rect.left, y: rect.top };
  }
</script>

<main>
  <div
    bind:this={div}
    class:active-hand={active}
    style:display="flex"
    style:width="{cardWidth * (1 + cardSpacing * (cards.length - 1))}px"
  >
    {#if active && $active_card !== undefined}
      {#each { length: numAttractors } as _, i}
        {@const powerX = 0.2}
        {@const powerY = 0.4}
        {@const x =
          cardWidth * cardSpacing * i +
          $active_card.offset.x -
          (cardWidth * powerX) / 2}
        {@const y = $active_card.offset.y - cardHeight * powerY}
        <div
          style:transform="translate({x}px,{y}px)"
          style:position="absolute"
          style:cursor="pointer"
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
                $invalidMelds.splice(from.group_index, 1);
                $invalidMelds = $invalidMelds;
              }
            }
            $active_card = undefined;
            activeAttractorIndex = undefined;
          }}
          on:keydown={undefined}
          style:z-index={`${i + 1}`}
        />
      {/each}
    {/if}
    {#each cards2 as card, i}
      {@const x = cardWidth * cardSpacing * i}
      <img
        style:border-radius="5px"
        style:box-shadow={$invalidMelds[index]
          ? "0px 0px 10px 10px #ff4444"
          : "none"}
        style:margin-bottom="{hovered[i] || activeAttractorIndex === i
          ? cardHeight / 16
          : 0}px"
        style:margin-top="{hovered[i] || activeAttractorIndex === i
          ? 0
          : cardHeight / 16}px"
        alt=""
        src={card_path(card, !hidden)}
        style:width="{cardWidth}px"
        style:margin-left="{i === 0 ? 0 : -cardWidth * (1 - cardSpacing)}px"
        style:cursor={active && $active_card === undefined
          ? "pointer"
          : "default"}
        on:mouseenter={!active || $active_card
          ? undefined
          : () => (hovered[i] = true)}
        on:mouseleave={!active || $active_card
          ? undefined
          : () => (hovered[i] = false)}
        on:click|stopPropagation={!active || $active_card !== undefined
          ? undefined
          : () => {
              const div_coord = getDivCoord();
              $invalidMelds[index] = false;
              hovered[i] = false;
              $show_active_card = true;
              $active_card = {
                card,
                offset: {
                  x: $mouse.x - x - div_coord.x,
                  y: $mouse.y - div_coord.y,
                },
                source: {
                  type: "table",
                  group_index: index,
                  card_index: i,
                  only_card: cards2.length === 1,
                },
              };
            }}
        on:keydown={undefined}
      />
    {/each}
  </div>
</main>
