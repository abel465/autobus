import type {
  ClientMessage,
  ServerMessage,
  RoomInfoMessage,
  GameStateMessage,
} from './message'
import { makeDeck, type Card } from './model.js'
import { shuffleArray } from './util.js'
import { update_game_state } from './game.js'

import { WebSocketServer, WebSocket as _WebSocket } from 'ws'

type WebSocket = _WebSocket & { room_id: string }

const bot_names = [
  'Agnes',
  'Buster',
  'Hank',
  'Harold',
  'Lucille',
  'Mordecai',
  'Pablo',
  'Tobias',
  'Walter',
]
const initial_player_names = [
  'Luna',
  'Milo',
  'Rosie',
  'Oliver',
  'Poppy',
  'Leo',
  'Daisy',
  'Finn',
  'Willow',
  'Oscar',
]

function random_unique_value<T>(array: T[], existing: T[]): T {
  const filtered_array = array.filter((item) => !existing.includes(item))
  if (filtered_array.length === 0) {
    return array[(Math.random() * array.length) | 0]
  }
  return filtered_array[(Math.random() * filtered_array.length) | 0]
}

const rooms: Record<string, RoomInfoMessage> = {}
const game_states: Record<string, GameStateMessage> = {}

const wss = new WebSocketServer<WebSocket>({ port: 8000 })

wss.on('connection', function connection(ws: WebSocket) {
  console.log('num clients: %d', wss.clients.size)
  function send_back(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending back: %s', payload)
    ws.send(payload)
  }
  function send(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending all: %s', payload)
    wss.clients.forEach((client) => {
      if (ws.room_id === client.room_id) {
        client.send(payload)
      }
    })
  }
  function send_others(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending others: %s', payload)
    wss.clients.forEach((client: WebSocket) => {
      if (client !== ws && ws.room_id === client.room_id) {
        client.send(payload)
      }
    })
  }
  ws.on('error', console.error)
  ws.on('close', console.error)

  ws.on('message', function message(data) {
    console.log('received: %s', data)

    const message: ClientMessage = JSON.parse(data.toString())
    switch (message.type) {
      case 'start_game': {
        if (game_states[message.room_id] !== undefined) {
          break
        }

        const deck = makeDeck()
        shuffleArray(deck)
        const players = rooms[message.room_id].players.map((player) => {
          const hand = []
          for (let i = 0; i < message.num_starting_cards; i++) {
            hand.push(deck.pop()!)
          }
          hand.sort(
            (a: Card, b: Card) =>
              a.suite.localeCompare(b.suite) || b.value - a.value
          )
          return {
            name: player.name,
            id: player.id,
            bot: player.bot,
            hand: hand,
          }
        })

        game_states[message.room_id] = {
          type: 'game_state',
          turn: 0,
          players: players,
          deck,
          table: [],
        }
        send(game_states[message.room_id])
        break
      }
      case 'remove_player': {
        if (game_states[message.room_id] !== undefined) {
          break
        }

        rooms[message.room_id].players.splice(
          rooms[message.room_id].players.findIndex(
            (player) => player.id === message.player_id
          ),
          1
        )
        send(rooms[message.room_id])
        break
      }
      case 'add_bot': {
        if (game_states[message.room_id] !== undefined) {
          break
        }

        rooms[message.room_id].players.push({
          name: random_unique_value(
            bot_names,
            rooms[message.room_id].players.map((player) => player.name)
          ),
          id: crypto.randomUUID(),
          bot: true,
        })
        send(rooms[message.room_id])
        break
      }
      case 'update_name': {
        if (game_states[message.room_id] !== undefined) {
          break
        }
        const player = rooms[message.room_id].players.find(
          (player) => player.id === message.player_id
        )
        if (player !== undefined) {
          player.name = message.player_name
          send_others(rooms[message.room_id])
        }
        break
      }
      case 'join_room': {
        const room_id = message.room_id

        if (
          game_states[room_id]?.players.some(
            (player) => player.id === message.player_id
          )
        ) {
          send_back(game_states[message.room_id])
          send_back(rooms[message.room_id])
          break
        }
        if (
          rooms[room_id]?.players.some(
            (player) => player.id === message.player_id
          )
        ) {
          send_back(rooms[message.room_id])
          break
        }

        if (rooms[room_id] === undefined) {
          send_back({
            type: 'error',
            error_type: 'join_room',
            reason: 'room_id doesnt exist',
          })
          break
        }
        if (game_states[room_id] !== undefined) {
          send_back({
            type: 'error',
            error_type: 'join_room',
            reason: 'game already started',
          })
          break
        }

        rooms[room_id].players.push({
          name:
            message.player_name ||
            random_unique_value(
              initial_player_names,
              rooms[room_id].players.map((player) => player.name)
            ),
          id: message.player_id,
          bot: false,
        })
        ws.room_id = message.room_id
        send(rooms[room_id])
        break
      }
      case 'create_room': {
        const room_id = crypto.randomUUID()
        rooms[room_id] = {
          type: 'room_info',
          room_id,
          players: [
            {
              name:
                message.player_name ||
                random_unique_value(initial_player_names, []),
              id: message.player_id,
              bot: false,
            },
          ],
        }
        ws.room_id = room_id
        send_back(rooms[room_id])
        break
      }
      case 'move_card': {
        console.log(message)
        update_game_state(message, game_states[message.room_id])
        send_others(message)
        break
      }
      case 'end_turn': {
        const game_state = game_states[message.room_id]
        game_state.turn++
        send_others(message)
        break
      }
    }
  })
})
