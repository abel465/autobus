import type {
  ClientMessage,
  RoomInfoMessage,
  GameStateMessage,
  MoveCardMessage,
  ErrorMessage,
  Deck,
  Hand,
  Table,
} from './message'
import type { Clingo } from './types'
import { type Card, getId } from './model'
import { sleep, shouldPlayBotTurn } from './util'
import { update_game_state, verify_game_state } from './game'
import {
  gameState,
  hasPlayed,
  hasPickedUp,
  invalidMelds,
  moves,
  yourTurn,
  yourPlayerIndex,
  getOpponentHandTransitionCoord,
  lastMove,
  lastMovePosition,
  tablePositions,
} from './stores'
import { getMoves } from './ClingoClient'

import WebSocket from 'isomorphic-ws'
import { get } from 'svelte/store'

const server_url: string = '127.0.0.1:8000/'

const on_cardMove = (move: MoveCardMessage) => {
  lastMove.set(move.from)
  if (!get(yourTurn)) {
    if (move.from.type === 'hand') {
      Object.assign(
        lastMovePosition,
        get(getOpponentHandTransitionCoord)(move.from.card_index)
      )
    } else if (move.from.type === 'table') {
      const { xs, y } = tablePositions[move.from.group_index]
      Object.assign(lastMovePosition, {
        x: xs[move.from.card_index],
        y,
      })
    }
  }
  gameState.set(update_game_state(move, get(gameState)))
}

export default class Client {
  clingo: Clingo
  ws: WebSocket
  roomInfo: RoomInfoMessage | undefined
  player_id: string

  constructor(
    clingo: Clingo,
    player_id: string,
    on_roomInfo: (roomInfo: RoomInfoMessage) => void,
    on_gameState: (gameState: GameStateMessage) => void,
    on_errorMessage: (errorMessage: ErrorMessage) => void,
    on_open: () => void,
    on_close: () => void
  ) {
    this.clingo = clingo
    clingo?.init('https://cdn.jsdelivr.net/npm/clingo-wasm/dist/clingo.wasm')

    console.log('setting up client')
    this.player_id = player_id
    this.ws = new WebSocket('ws://' + server_url + 'ws')

    this.ws.onerror = console.error

    this.ws.onmessage = (response) => {
      const message = (() => {
        const data = response.data.toString()
        console.log('received: %s', data)
        return JSON.parse(data)
      })()

      switch (message.type) {
        case 'error': {
          on_errorMessage(message)
          break
        }
        case 'game_state': {
          on_gameState(message)
          break
        }
        case 'room_info': {
          on_roomInfo(message)
          this.roomInfo = message
          break
        }
        case 'move_card': {
          on_cardMove(message)
          break
        }
        case 'end_turn': {
          this.on_endTurn()
          break
        }
      }
    }

    this.ws.onclose = () => {
      console.log('Closed Websocket connection')
      on_close()
    }

    this.ws.onopen = () => {
      console.log('Opened Websocket connection')
      on_open()
    }
  }

  send(message: ClientMessage) {
    const payload = JSON.stringify(message)
    console.log('sending: %s', payload)
    this.ws.send(payload)
  }
  createRoom(player_name: string | undefined) {
    this.send({ type: 'create_room', player_name, player_id: this.player_id })
  }
  joinRoom(room_id: string, player_name: string | undefined) {
    this.send({
      type: 'join_room',
      room_id,
      player_name,
      player_id: this.player_id,
    })
  }
  startGame() {
    this.send({
      type: 'start_game',
      room_id: this.roomInfo!.room_id,
      num_starting_cards: 18,
    })
  }
  moveCard(
    from: Deck | Hand | Table,
    to: Hand | Table,
    card: Card,
    save: boolean = true,
    player_id?: string
  ) {
    const message: MoveCardMessage = {
      type: 'move_card',
      room_id: this.roomInfo!.room_id,
      player_id: player_id || this.player_id,
      from,
      to,
      card,
    }

    on_cardMove(message)
    this.send(message)

    if (save) {
      const mvs = get(moves)
      if (mvs.at(-1)?.from.type === 'deck') {
        mvs.pop()
        if (message.to.type !== 'hand') {
          mvs.push(message)
        }
      } else {
        mvs.push(message)
      }

      if (
        message.from.type === 'deck' ||
        (message.from.type === 'hand' && message.to.type === 'table')
      ) {
        hasPlayed.set(true)
      }
    }
  }

  sortCards(player_id: string) {
    // this.send({ type: 'sort_cards', room_id: this.roomInfo!.room_id, player_id })
  }

  updateName(player_name: string, player_id: string) {
    this.send({
      type: 'update_name',
      player_name,
      room_id: this.roomInfo!.room_id,
      player_id,
    })
  }
  addBot() {
    this.send({ type: 'add_bot', room_id: this.roomInfo!.room_id })
  }
  async reset() {
    const mvs = get(moves)
    hasPlayed.set(false)
    while (mvs.length > 0) {
      const { from, to, card } = mvs.pop()!
      this.moveCard(to, from as Hand | Table, card, false)
      if (mvs.length > 0) {
        await sleep(100)
      }
    }
    moves.set(mvs)
    invalidMelds.set([])
  }
  async playBotTurn(): Promise<void> {
    const game_state = get(gameState)
    const current_player_index = game_state.turn % game_state.players.length
    const current_player = game_state.players[current_player_index]
    const hand = current_player.hand
    const moves = (
      await Promise.all([
        getMoves(window.clingo, game_state.table, hand),
        sleep(3000),
      ])
    )[0]
    if (moves.length === 0) {
      this.moveCard(
        { type: 'deck' },
        { type: 'hand', card_index: 0 },
        game_state.deck.at(-1)!,
        false,
        current_player.id
      )
    } else {
      const delay_ms = 1200
      for (const move of moves) {
        const get_card_index = (meld: Card[], card: Card) => {
          const is_run = meld[0].suite === card.suite
          if (!is_run || meld.length === 1) {
            return meld.length
          }
          const is_ascending = meld[0].value < meld[1].value

          const meld_copy = [...meld.map(({ value }) => value), card.value]
          meld_copy.sort((a, b) => a - b)
          if (!is_ascending) {
            meld_copy.reverse()
          }
          return meld_copy.indexOf(card.value)
        }
        const table = game_state.table
        const from = move.type === 'hand' ? hand : table[move.from.i]
        const from_index = from.findIndex((card) => getId(card) === move.id)
        const card = from[from_index]

        const to = game_state.table[move.to.i]
        const only_card = to === undefined
        this.moveCard(
          move.type === 'hand'
            ? { type: 'hand', card_index: from_index }
            : {
                type: 'table',
                group_index: move.from.i,
                card_index: from_index,
                only_card: false,
              },
          {
            type: 'table',
            group_index: move.to.i,
            card_index: only_card ? 0 : get_card_index(to, card),
            only_card,
          },
          card,
          false,
          current_player.id
        )
        await sleep(delay_ms)
      }
    }
  }
  incrementTurn() {
    const game_state = get(gameState)
    game_state.turn++
    yourTurn.set(
      game_state.turn % game_state.players.length === get(yourPlayerIndex)
    )
    gameState.set(game_state)
  }
  async on_endTurn() {
    hasPickedUp.set(false)
    this.incrementTurn()

    while (shouldPlayBotTurn(get(gameState), this.roomInfo!, this.player_id)) {
      await this.playBotTurn()
      this.incrementTurn()
      this.send({ type: 'end_turn', room_id: this.roomInfo!.room_id })
    }
  }
  async endTurn() {
    const invalid_melds = verify_game_state(get(gameState))
    if (invalid_melds.every((invalid) => !invalid)) {
      hasPlayed.set(false)
      moves.set([])
      this.send({ type: 'end_turn', room_id: this.roomInfo!.room_id })
      await this.on_endTurn()
    } else {
      invalidMelds.set(invalid_melds)
    }
  }
  removePlayer(player_id: string) {
    this.send({
      type: 'remove_player',
      room_id: this.roomInfo!.room_id,
      player_id,
    })
  }
}
