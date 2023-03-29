import WebSocket from 'isomorphic-ws'
import { player_id, gameState } from './stores'
// import { sleep } from './util'
import { get, writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
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
import type { PhysicalCard } from './model'
import { update_game_state, verify_game_state } from './game'
import { hasPickedUp } from './stores'

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
  ws: WebSocket
  roomInfo: RoomInfoMessage | undefined
  gameState: Writable<GameStateMessage> = writable()
  constructor(
    on_roomInfo: (roomInfo: RoomInfoMessage) => void,
    on_gameState: (gameState: GameStateMessage) => void,
    on_errorMessage: (errorMessage: ErrorMessage) => void,
    on_open: () => void,
    on_close: () => void
  ) {
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
          this.gameState.set(message)
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
  createRoom(player_name: string) {
    this.send({ type: 'create_room', player_name, player_id: get(player_id) })
  }
  joinRoom(room_id: string, player_name: string) {
    this.send({
      type: 'join_room',
      room_id,
      player_name,
      player_id: get(player_id),
    })
  }
  startGame() {
    this.send({
      type: 'start_game',
      room_id: this.roomInfo!.room_id,
      num_starting_cards: 15,
    })
  }
  moveCard(from: Deck | Hand | Table, to: Hand | Table, card: PhysicalCard) {
    const message: MoveCardMessage = {
      type: 'move_card',
      room_id: this.roomInfo!.room_id,
      player_id: get(player_id),
      from,
      to,
      card,
    }
    on_cardMove(message)
    this.send(message)
  }

  addBot() {
    this.send({ type: 'add_bot', room_id: this.roomInfo!.room_id })
  }
  endTurn() {
    verify_game_state(get(gameState)).then((valid) => {
      if (valid) {
        on_endTurn()
        this.send({ type: 'end_turn', room_id: this.roomInfo!.room_id })
      }
    })
  }
  removePlayer(player_id: string) {
    this.send({
      type: 'remove_player',
      room_id: this.roomInfo!.room_id,
      player_id,
    })
  }

  pingServer() {
    this.ws.send('ping')
  }
}
