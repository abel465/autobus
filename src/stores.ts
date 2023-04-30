import type { Card } from './model'
import type { Coord, CoordWithAngle } from './util'
import type { Hand, Table, Deck, MoveCardMessage } from './message'
import type { GameState } from './message'

import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { browser } from '$app/environment'

type ActiveCard = {
  card: Card
  offset: Coord
  source: Hand | Table | Deck
}

export const active_card: Writable<ActiveCard | undefined> = writable(undefined)
export const show_active_card: Writable<boolean> = writable(false)
export const hasPickedUp: Writable<boolean> = writable(false)
export const hasPlayed: Writable<boolean> = writable(false)
export const mouse: Writable<Coord> = writable({ x: 0, y: 0 })
export const gameState: Writable<GameState> = writable()
export const invalidMelds: Writable<Record<number, boolean>> = writable([])

export const player_name = writable(
  (browser && localStorage.getItem('autobus_player_name')) || undefined
)
player_name.subscribe((value) => {
  if (browser && value !== undefined) {
    localStorage.setItem('autobus_player_name', value)
  }
})
export const moves: Writable<MoveCardMessage[]> = writable([])
export const yourTurn: Writable<boolean> = writable(false)
export const yourPlayerIndex: Writable<number> = writable()
export const currentPlayerIndex: Writable<number> = writable()
export const getOpponentHandTransitionCoord: Writable<
  (index: number) => CoordWithAngle
> = writable()
export const deckCoord: Coord = { x: 0, y: 0 }
export const lastMove: Writable<Hand | Table | Deck> = writable()
export const lastMovePosition: CoordWithAngle = { x: 0, y: 0, angle: 0 }
export const tablePositions: { xs: number[]; y: number }[] = []
