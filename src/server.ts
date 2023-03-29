import { WebSocketServer, WebSocket } from 'ws'
import type {
  ClientMessage,
  ServerMessage,
  RoomInfoMessage,
  GameStateMessage,
} from './message'
import { makeDeck } from './model.js'
import { shuffleArray } from './util.js'
import { update_game_state, verify_game_state } from './game.js'



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

const rooms: Record<string, RoomInfoMessage> = {}
const game_states: Record<string, GameStateMessage> = {}
const game_states_backup: Record<string, GameStateMessage> = {}

const wss = new WebSocketServer({ port: 8000 })

wss.on('connection', function connection(ws) {
  function send_back(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending back: %s', payload)
    ws.send(payload)
  }
  function send(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending all: %s', payload)
    wss.clients.forEach((client) => {
      client.send(payload)
    })
  }
  function send_others(message: ServerMessage) {
    const payload = JSON.stringify(message)
    console.log('sending others: %s', payload)
    wss.clients.forEach((client) => {
      if (client !== ws) {
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
          return {
            id: player.id,
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
        game_states_backup[message.room_id] = game_states[message.room_id]
        send(game_states[message.room_id])
        break
      }
      case 'remove_player': {
        if (game_states[message.room_id] !== undefined) {
          break
        }

        rooms[message.room_id].players.splice(
          rooms[message.room_id].players.findIndex(
            (player) => player.id == message.player_id
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
          name: bot_names[(Math.random() * bot_names.length) | 0],
          id: crypto.randomUUID(),
          bot: true,
        })
        send(rooms[message.room_id])
        break
      }
      case 'join_room': {
        const room_id = message.room_id

        if (
          game_states[room_id]?.players.some(
            (player) => player.id == message.player_id
          )
        ) {
          send_back(game_states[message.room_id])
          send_back(rooms[message.room_id])
          break
        }
        if (
          rooms[room_id]?.players.some(
            (player) => player.id == message.player_id
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
          name: message.player_name,
          id: message.player_id,
          bot: false,
        })
        send(rooms[room_id])
        break
      }
      case 'create_room': {
        const room_id = crypto.randomUUID()
        rooms[room_id] = {
          type: 'room_info',
          room_id,
          players: [
            { name: message.player_name, id: message.player_id, bot: false },
          ],
        }
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
        verify_game_state(game_state).then((valid) => {
          if (valid) {
            game_state.turn++
            game_states_backup[message.room_id] = game_state
            send_others(message)
          } else {
            send_back({ type: 'error', error_type: 'invalid_game_state' })
          }
        })
        break
      }
    }
  })
})
