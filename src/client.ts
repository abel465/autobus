import WebSocket from 'isomorphic-ws'
import { gameState, hasPlayed } from './stores'
import { get } from 'svelte/store'
import { sleep } from './util'
import type {
  ClientMessage,
  ServerMessage,
  RoomInfoMessage,
  GameStateMessage,
  MoveCardMessage,
  ErrorMessage,
  Deck,
  Hand,
  Table,
} from './message'
import type { Card } from './model'
import { update_game_state, verify_game_state } from './game'
import type { Clingo } from './types'
import { hasPickedUp, invalidMelds, moves } from './stores'

const server_url: string = '127.0.0.1:8000/'

const on_cardMove = (move: MoveCardMessage) => {
  gameState.set(update_game_state(move, get(gameState)))
}
const on_endTurn = () => {
  hasPickedUp.set(false)
  const game_state = get(gameState)
  game_state.turn++
  gameState.set(game_state)
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
      const message: ServerMessage = JSON.parse(response.data.toString())
      console.log('Message from server ', message)

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
          on_endTurn()
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
  sendd(msg: string) {
    this.ws.send(msg)
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
      num_starting_cards: 15,
    })
  }
  moveCard(from: Deck | Hand | Table, to: Hand | Table, card: Card) {
    const message: MoveCardMessage = {
      type: 'move_card',
      room_id: this.roomInfo!.room_id,
      player_id: this.player_id,
      from,
      to,
      card,
    }
    const mvs = get(moves)
    if (mvs.at(-1)?.from.type === 'deck') {
      mvs.pop()
      if (message.to.type !== 'hand') {
        mvs.push(message)
      }
    } else {
      mvs.push(message)
    }
    on_cardMove(message)
    this.send(message)

    if (
      message.from.type === 'deck' ||
      (message.from.type === 'hand' && message.to.type === 'table')
    ) {
      hasPlayed.set(true)
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
      const last_move = mvs.pop()!
      const message: MoveCardMessage = {
        type: 'move_card',
        room_id: this.roomInfo!.room_id,
        player_id: this.player_id,
        from: last_move.to,
        to: last_move.from as Hand | Table,
        card: last_move.card,
      }
      on_cardMove(message)
      this.send(message)
      if (mvs.length > 0) {
        await sleep(100)
      }
    }
    moves.set(mvs)
  }
  endTurn() {
    const invalid_melds = verify_game_state(get(gameState), this.clingo)
    if (invalid_melds.every((invalid) => !invalid)) {
      hasPlayed.set(false)
      moves.set([])
      on_endTurn()
      this.send({ type: 'end_turn', room_id: this.roomInfo!.room_id })
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
