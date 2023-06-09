const suites = ['h', 's', 'c', 'd'] as const
const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const
export type Suite = (typeof suites)[number]
export type Value = (typeof values)[number]

export function card_path(card: Card, front: boolean): string {
  if (front) {
    return `/cards/${card.value}${card.suite}.svg`
  } else {
    return `/cards/back${card.deck_id}.svg`
  }
}

export type Card = {
  value: Value
  suite: Suite
  deck_id: number
}

export function getId(card: Card): string {
  return `${card.value}${card.suite}${card.deck_id}`
}

export const makeDeck: () => Card[] = () => {
  const cards = values.flatMap((value) =>
    suites.map((suite) => ({
      value,
      suite,
    }))
  )
  return cards
    .map(({ value, suite }) => ({
      value,
      suite,
      deck_id: 0,
    }))
    .concat(
      cards.map(({ value, suite }) => ({
        value,
        suite,
        deck_id: 1,
      }))
    )
}
