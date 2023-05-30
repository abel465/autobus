import type {
  ClientMessage,
  ServerMessage,
  RoomInfoMessage,
  GameStateMessage,
  StartGameMessage,
  RemovePlayerMessage,
  AddBotMessage,
  UpdateNameMessage,
  JoinRoomMessage,
  CreateRoomMessage,
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
  console.log('Adding client. num clients: %d', wss.clients.size)

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

  function start_game({ room_id, num_starting_cards }: StartGameMessage) {
    if (game_states[room_id]) {
      return
    }

    const deck = makeDeck()
    shuffleArray(deck)

    const players = rooms[room_id].players.map((player) => {
      const hand = deck
        .splice(-num_starting_cards - 1, num_starting_cards)
        .sort(
          (a: Card, b: Card) =>
            a.suite.localeCompare(b.suite) || b.value - a.value
        )
      return Object.assign({}, player, { hand })
    })

    game_states[room_id] = {
      type: 'game_state',
      turn: 0,
      players,
      deck,
      table: [],
    }
    send(game_states[room_id])
  }
  function remove_player({ room_id, player_id }: RemovePlayerMessage) {
    if (game_states[room_id]) {
      return
    }

    const room = rooms[room_id]
    room.players.splice(
      room.players.findIndex(({ id }) => id === player_id),
      1
    )
    send(room)
  }
  function add_bot({ room_id }: AddBotMessage) {
    if (game_states[room_id]) {
      return
    }

    const room = rooms[room_id]
    room.players.push({
      name: random_unique_value(
        bot_names,
        room.players.map(({ name }) => name)
      ),
      id: crypto.randomUUID(),
      bot: true,
    })
    send(room)
  }
  function update_name({ room_id, player_id, player_name }: UpdateNameMessage) {
    if (game_states[room_id]) {
      return
    }

    const player = rooms[room_id].players.find(({ id }) => id === player_id)
    if (player) {
      player.name = player_name
      send_others(rooms[room_id])
    }
  }
  function join_room({ room_id, player_id, player_name }: JoinRoomMessage) {
    const room = rooms[room_id]
    const game_state = game_states[room_id]

    if (game_state?.players.some(({ id }) => id === player_id)) {
      send_back(game_state)
      send_back(room)
      return
    }
    if (room?.players.some(({ id }) => id === player_id)) {
      send_back(room)
      return
    }

    if (!room) {
      send_back({
        type: 'error',
        error_type: 'join_room',
        reason: 'room_id does not exist',
      })
      return
    }
    if (game_state) {
      send_back({
        type: 'error',
        error_type: 'join_room',
        reason: 'game already started',
      })
      return
    }

    room.players.push({
      name:
        player_name ||
        random_unique_value(
          initial_player_names,
          room.players.map(({ name }) => name)
        ),
      id: player_id,
      bot: false,
    })
    ws.room_id = room_id
    send(room)
  }
  function create_room({ player_id, player_name }: CreateRoomMessage) {
    const room_id = crypto.randomUUID()
    rooms[room_id] = {
      type: 'room_info',
      room_id,
      players: [
        {
          name: player_name || random_unique_value(initial_player_names, []),
          id: player_id,
          bot: false,
        },
      ],
    }
    ws.room_id = room_id
    send_back(rooms[room_id])
  }

  ws.on('error', console.error)
  ws.on('close', console.error)
  ws.on('message', function message(data) {
    console.log('received: %s', data)

    const message: ClientMessage = JSON.parse(data.toString())
    switch (message.type) {
      case 'start_game': {
        start_game(message)
        break
      }
      case 'remove_player': {
        remove_player(message)
        break
      }
      case 'add_bot': {
        add_bot(message)
        break
      }
      case 'update_name': {
        update_name(message)
        break
      }
      case 'join_room': {
        join_room(message)
        break
      }
      case 'create_room': {
        create_room(message)
        break
      }
      case 'move_card': {
        update_game_state(message, game_states[message.room_id])
        send_others(message)
        break
      }
      case 'end_turn': {
        game_states[message.room_id].turn++
        send_others(message)
        break
      }
    }
  })
})
