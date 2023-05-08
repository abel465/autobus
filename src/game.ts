import type { MoveCardMessage, GameState, Table, Hand } from './message'
import type { Card } from './model'
import { meldAnimationKeys, yourTurn } from './stores'

import { get } from 'svelte/store'

function verify_meld(meld: Card[]): boolean {
  if (meld.length < 3) {
    return false
  }
  if (
    meld.every((card) => card.value === meld[0].value) &&
    new Set(meld.map(({ suite }) => suite)).size === meld.length
  ) {
    return true
  }
  const values_consecutive = (dif: number) => {
    for (let i = 0; i < meld.length - 1; i++) {
      const [v1, v2] = meld.slice(i, i + 2).map(({ value }) => value)
      if (v1 !== v2 + dif) {
        if (!((v1 === 1 && v2 === 13) || (v1 === 13 && v2 === 1))) {
          return false
        }
      }
    }
    return true
  }
  return (
    meld.every((card) => card.suite === meld[0].suite) &&
    (values_consecutive(1) || values_consecutive(-1))
  )
}

export function verify_game_state(game_state: GameState): boolean[] {
  return game_state.table.map(verify_meld).map((valid) => !valid)
}

function getNewId(ids: number[]): number {
  let i = 0
  while (ids.includes(i)) {
    i++
  }
  return i
}

export function update_game_state(
  move: MoveCardMessage,
  game_state: GameState
): GameState {
  if (move.to.type === 'table' && move.to.only_card) {
    game_state.table.push([])
    if (move.from.type !== 'table' || get(yourTurn)) {
      meldAnimationKeys.push(getNewId(meldAnimationKeys))
    } else {
      meldAnimationKeys.push(meldAnimationKeys[move.from.group_index])
    }
  }

  const player = game_state.players.find(
    (player) => player.id === move.player_id
  )!

  const move_to = (to: Hand | Table) => {
    ;(to.type === 'hand'
      ? player.hand
      : game_state.table[to.group_index]
    ).splice(to.card_index, 0, move.card)
  }

  switch (move.from.type) {
    case 'deck': {
      game_state.deck.pop()
      move_to(move.to)
      break
    }
    case 'hand': {
      player.hand.splice(move.from.card_index, 1)
      move_to(move.to)
      break
    }
    case 'table': {
      const from_index = move.from.group_index
      if (move.from.only_card) {
        game_state.table.splice(from_index, 1)
        meldAnimationKeys.splice(from_index, 1)
      } else {
        game_state.table[from_index].splice(move.from.card_index, 1)
      }
      move_to(move.to)

      break
    }
  }
  return game_state
}
