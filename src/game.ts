import type { MoveCardMessage, GameStateMessage, Table } from './message'
import type { Clingo } from './types'
import type { Card } from './model'
import { invalidMelds } from './stores'
import { get } from 'svelte/store'

function verify_meld(meld: Card[]): boolean {
  if (meld.length < 3) {
    return false
  }
  if (
    meld.every((card) => card.value === meld[0].value) &&
    new Set(meld).size === meld.length
  ) {
    return true
  }
  const values_consecutive = (dif: number) => {
    for (let i = 0; i < meld.length - 1; i++) {
      if (meld[i].value !== meld[i + 1].value + dif) {
        return false
      }
    }
    return true
  }
  return (
    meld.every((card) => card.suite === meld[0].suite) &&
    (values_consecutive(1) || values_consecutive(-1))
  )
}

export function verify_game_state(
  game_state: GameStateMessage,
  clingo: Clingo
): boolean[] {
  return game_state.table.map(verify_meld).map((valid) => !valid)
  // .map((valid, i) => ({ valid, i }))
  // .filter(({ valid, i }) => !valid)
  // .map(({ valid, i }) => i)
  // const input = game_state.table
  //   .flatMap((meld, i) =>
  //     meld.map((card) => {
  //       const value = card.value
  //       const suite = card.suite
  //       const id = `${value}${suite}${card.deck_id}`
  //       return `line(${i}, "${id}", ${value}, ${suite}).\n`
  //     })
  //   )
  //   .join('')
  // const result = await clingo.run(input + cards_verify_lp)
  // if (result.Result === 'SATISFIABLE') {
  //   console.log(result)
  //   return true
  // } else {
  //   console.log(result.Result)
  //   console.log(result)
  //   return false
  // }
}

export function update_game_state(
  move: MoveCardMessage,
  game_state: GameStateMessage
): GameStateMessage {
  const player = game_state.players.find(
    (player) => player.id === move.player_id
  )!

  const move_to_table = (to: Table) => {
    if (game_state.table.length === to.group_index) {
      game_state.table.push([])
    }
    game_state.table[to.group_index].splice(to.card_index, 0, move.card)
  }

  switch (move.from.type) {
    case 'deck': {
      console.log('moving from deck')
      if (move.to.type == 'hand') {
        player.hand.splice(move.to.index, 0, move.card)
      } else if (move.to.type == 'table') {
        console.log('moving to table')
        move_to_table(move.to)
      }
      break
    }
    case 'hand': {
      player.hand.splice(move.from.index, 1)
      console.log('moving from hand')
      if (move.to.type == 'hand') {
        player.hand.splice(move.to.index, 0, move.card)
      } else if (move.to.type == 'table') {
        console.log('moving to table')
        move_to_table(move.to)
      }
      break
    }
    case 'table': {
      console.log('moving from table')
      game_state.table[move.from.group_index].splice(move.from.card_index, 1)
      if (move.to.type == 'table') {
        console.log('moving to table')
        move_to_table(move.to)
      }

      if (game_state.table[move.from.group_index].length === 0) {
        game_state.table.splice(move.from.group_index, 1)
      }
      break
    }
  }
  return game_state
}
