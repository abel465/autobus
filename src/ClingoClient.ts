import type { Card } from './model'
import type { Clingo, ClingoResultOptimum } from './types'
import { getId } from './model'

import cards_lp from '../cards.lp?raw'
import moves_lp from '../card_moves.lp?raw'

type ResultOptimum = ClingoResultOptimum['Call'][0]['Witnesses'][0]

async function getOptimum(
  clingo: Clingo,
  input: string,
  ...extraArgs: string[]
): Promise<ResultOptimum> {
  console.log(input)
  console.log(
    `clingo lp 1 --opt-mode=optN --quiet=1 --configuration=trendy ${extraArgs.join(
      ' '
    )}`
  )
  const result = await clingo.run(input, 1, [
    '--opt-mode=optN',
    '--quiet=1',
    '--configuration=trendy',
    ...extraArgs,
  ])
  console.log(result.Result)
  console.log(result)
  if (result.Result !== 'OPTIMUM FOUND') {
    throw new Error(`Invalid result: ${JSON.stringify(result)}`)
  }
  return result.Call[0].Witnesses[0]
}

function createInput(table: Card[][], hand: Card[]): string {
  const input = hand.map(
    (card) => `hand("${getId(card)}", ${card.value}, ${card.suite}).\n`
  )

  input.push(
    ...table.flatMap((cards, i) =>
      cards.map(
        (card) =>
          `input_meld(${i}, "${getId(card)}", ${card.value}, ${card.suite}).\n`
      )
    )
  )

  return input.join('')
}

type ClingoMove =
  | {
      type: 'hand'
      id: string
      n: number
      to: {
        i: number
      }
    }
  | {
      type: 'table'
      id: string
      n: number
      from: {
        i: number
      }
      to: {
        i: number
      }
    }

function get_moves(values: string[]): ClingoMove[] {
  return values
    .map((value) => {
      if (value.startsWith('hmove(')) {
        const [n, i, id] = value.slice(6, -1).split(',')
        return {
          type: 'hand' as const,
          id: id.slice(1, -1),
          n: +n,
          to: {
            i: +i,
          },
        }
      } else if (value.startsWith('tmove(')) {
        const [n, i1, i2, id] = value.slice(6, -1).split(',')
        return {
          type: 'table' as const,
          id: id.slice(1, -1),
          n: +n,
          from: {
            i: +i1,
          },
          to: {
            i: +i2,
          },
        }
      } else {
        throw new Error(`Invalid value: ${value}`)
      }
    })
    .sort((m1, m2) => m1.n - m2.n)
}

export async function getMoves(
  clingo: Clingo,
  table: Card[][],
  hand: Card[]
): Promise<ClingoMove[]> {
  const input = createInput(table, hand)
  const result = await getOptimum(clingo, input + cards_lp)
  const meld_values = result.Value.filter((v) => v.startsWith('meld('))
  const num_input_meld_values = table.reduce(
    (count, meld) => count + meld.length,
    0
  )
  const num_moved_meld_values = result.Costs[1] || 0
  const num_moves =
    meld_values.length - num_input_meld_values + num_moved_meld_values
  if (num_moves === 0) {
    return []
  }
  const input2 = meld_values.map((v) => v + '.\n').join('')
  return get_moves(
    (
      await getOptimum(
        clingo,
        input + input2 + moves_lp,
        '-c',
        `max_num_moves=${num_moves}`
      )
    ).Value
  )
}
