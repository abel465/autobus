import type { MoveCardMessage, GameStateMessage, Table } from './message'
// import * as clingo from 'clingo-wasm'
// import bob from 'clingo-wasm'
// type Clingo = typeof _clingo
// const clingo = (_clingo.default as unknown as Clingo)
// const clingo = _clingo
// import cards_ins_lp from '../cards_ins.lp?raw'
// import cards_lp from '../cards.lp?raw'
// import cards_verify_lp from '../cards_verify.lp?raw'
// import { type Card, type Suite, type Value, getSuite, getValue } from './model'
// // import vmeld_lp from '../vmeld.lp?raw'
// // console.log(cards_lp)
// // console.log("===========")
// // console.log(clingo)
// // console.log("===========")
// const result = await clingo.run(cards_ins_lp + cards_lp, 1, [
//   '--opt-mode=optN',
//   '--quiet=1',
// ])
// if (result.Result === 'ERROR') {
//   console.log(result.Result)
//   console.log(result)
// } else if (result.Result === 'UNSATISFIABLE') {
//   console.log(result.Result)
//   console.log(result)
// } else if (result.Result === 'OPTIMUM FOUND') {
//   console.log(JSON.stringify(result.Call[0].Witnesses[0].Value))
// }

export async function verify_game_state(
  game_state: GameStateMessage
): Promise<boolean> {
  // const lines: string[] = []
  // game_state.table.forEach((group) => {
  //   group.forEach((card, i) => {
  //     const value = getValue(card.front)
  //     const suite = getSuite(card.front)
  //     lines.push(`meld(${i}, ${card.front + card.back}), ${value}, ${suite}`)
  //   })
  // })
  // const result = await clingo.run(cards_verify_lp, 1)
  // // for (const group in game_state.table) {
  // //   for (const card in group) {
  // //     // lines.push()
  // //   }
  // // }
  // console.log(result)

  return true
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
