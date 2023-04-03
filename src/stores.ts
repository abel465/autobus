import { writable } from 'svelte/store'
import type { Writable } from 'svelte/store'
import type { Card } from './model'
import type { Hand, Table, Deck } from './message'
import type { GameStateMessage } from './message'
import { browser } from '$app/environment'

type ActiveCard = {
  card: Card
  offset: Coord
  source: Hand | Table | Deck
}

type Coord = {
  x: number
  y: number
}

export type AttractorType = {
  target: Coord
  powerX: number
  powerY: number
  bounding_rectangle: {
    top_left: Coord
    bottom_right: Coord
  }
  on_attract: () => void
  on_unattract: () => void
  active: boolean
}

export const active_card: Writable<ActiveCard | undefined> = writable(undefined)
export const show_active_card: Writable<boolean> = writable(false)
export const hasPickedUp: Writable<boolean> = writable(false)
export const hasPlayed: Writable<boolean> = writable(false)
// export const active_card_offset: Writable<Coord> = writable({x: 0, y: 0})
export const mouse: Writable<Coord> = writable({ x: 0, y: 0 })
// export const selectedSource: Writable<SelectedSource> = writable(SelectedSource.None)
// export const active_card_attractors: Writable<Map<string, AttractorType>> = writable(new Map())
export const gameState: Writable<GameStateMessage> = writable()
export const invalidMelds: Writable<boolean[]> = writable([])

export const player_name = writable(
  browser && localStorage.getItem('autobus_player_name') || undefined
)
player_name.subscribe((value) => {
  if (browser && value !== undefined) {
    localStorage.setItem('autobus_player_name', value)
  }
})
