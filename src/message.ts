import type { Card } from './model'

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
  | UpdateNameMessage

type ClientMessageBase = {
  player_id: string
}

export type StartGameMessage = {
  type: 'start_game'
  room_id: string
  num_starting_cards: number
}
export type CreateRoomMessage = {
  type: 'create_room'
  player_id: string
  player_name?: string
}
export type RemovePlayerMessage = {
  type: 'remove_player'
  room_id: string
  player_id: string
}
export type JoinRoomMessage = {
  type: 'join_room'
  room_id: string
  player_id: string
  player_name?: string
}
export type AddBotMessage = {
  type: 'add_bot'
  room_id: string
}
type EndTurnMessage = {
  type: 'end_turn'
  room_id: string
}

export type Hand = {
  type: 'hand'
  card_index: number
}
export type Table = {
  type: 'table'
  group_index: number
  card_index: number
  only_card: boolean
}
export type Deck = {
  type: 'deck'
}

export type MoveCardMessage = {
  type: 'move_card'
  player_id: string
  room_id: string
  card: Card
  from: Hand | Table | Deck
  to: Hand | Table
}

export type RoomInfo = {
  room_id: string
  players: {
    name: string
    id: string
    bot: boolean
  }[]
}
export type RoomInfoMessage = {
  type: 'room_info'
} & RoomInfo

export type UpdateNameMessage = {
  type: 'update_name'
  player_id: string
  room_id: string
  player_name: string
}

export type GameState = {
  turn: number
  players: {
    name: string
    id: string
    bot: boolean
    hand: Card[]
  }[]
  deck: Card[]
  table: Card[][]
}
export type GameStateMessage = {
  type: 'game_state'
} & GameState

type ErrorType = 'join_room'

export type ErrorMessage = {
  type: 'error'
  error_type: ErrorType
  reason?: string
}
