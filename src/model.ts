// import KS from '/static/images/cards/KS.svg'

function makeCard<V extends string, S extends string>(v: V, s: S) {
  return (v + s) as `${V}${S}`
}

const suites = ['H', 'S', 'C', 'D']
export type Suite = (typeof suites)[number]
export type Value = (typeof values)[number]
const values = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const
export type CardBack = 'Blue_Back'| 'Red_Back'
const blueBack = 'Blue_Back' as CardBack
const redBack = 'Red_Back' as CardBack

const cards = values.flatMap((v) => suites.map((s) => makeCard(v, s)))
export type Card = (typeof cards)[number]

export type PhysicalCard = {
  front: Card
  back: CardBack
}

export const makeDeck: () => PhysicalCard[] = () => 
  cards
    .map((front: Card) => ({ front, back: blueBack }))
    .concat(cards.map((front: Card) => ({ front, back: redBack })))

export function getSuite(card: Card): Suite {
  return card[card.length - 1]
}

export function getValue(card: Card): Value {
  return card.slice(0, -1) as Value
}
