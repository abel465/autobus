import type { PhysicalCard } from './model'

export type ServerMessage =
  | RoomInfoMessage
  | MoveCardMessage
  | GameStateMessage
  | ErrorMessage
  | EndTurnMessage
export type ClientMessage =
  | CreateRoomMessage
  | JoinRoomMessage
  | RemovePlayerMessage
  | AddBotMessage
  | StartGameMessage
  | MoveCardMessage
  | EndTurnMessage

type StartGameMessage = {
  type: 'start_game'
  room_id: string
  num_starting_cards: number
}
type CreateRoomMessage = {
  type: 'create_room'
  player_id: string
  player_name: string
}
type RemovePlayerMessage = {
  type: 'remove_player'
  room_id: string
  player_id: string
}
type JoinRoomMessage = {
  type: 'join_room'
  room_id: string
  player_id: string
  player_name: string
}
type AddBotMessage = {
  type: 'add_bot'
  room_id: string
}
type EndTurnMessage = {
  type: 'end_turn'
  room_id: string
}

export type Hand = {
  type: 'hand'
  index: number
}
export type Table = {
  type: 'table'
  group_index: number
  card_index: number
}
export type Deck = {
  type: 'deck'
}

export type MoveCardMessage = {
  type: 'move_card'
  player_id: string
  room_id: string
  card: PhysicalCard
  from: Hand | Table | Deck
  to: Hand | Table
}

export type RoomInfoMessage = {
  type: 'room_info'
  room_id: string
  players: {
    name: string
    id: string
    bot: boolean
  }[]
}

export type GameStateMessage = {
  type: 'game_state'
  turn: number
  players: {
    id: string
    hand: PhysicalCard[]
  }[]
  deck: PhysicalCard[]
  table: PhysicalCard[][]
}

type ErrorType = 'join_room' | 'invalid_game_state'

export type ErrorMessage = {
  type: 'error'
  error_type: ErrorType
  reason?: string
}
