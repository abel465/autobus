import type { GameState, RoomInfo } from './message'

export const sleep = (sleep_ms: number) =>
  new Promise((resolve) => setTimeout(resolve, sleep_ms))

export function shuffleArray<T>(array: T[]): T[] {
  for (let i: number = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

export function debounce_leading(func: Function, timeout: number) {
  let timer: NodeJS.Timeout | undefined = undefined
  return function (this: any, ...args: any[]) {
    if (!timer) {
      func.apply(this, args)
    }
    clearTimeout(timer)
    timer = setTimeout(() => {
      timer = undefined
    }, timeout)
  }
}

export async function sleepBetween<T>(
  array: T[],
  sleepMs: number,
  fn: (value: T, index: number) => void
) {
  for (const [i, v] of array.entries()) {
    if (i !== 0) {
      await sleep(sleepMs)
    }
    fn(v, i)
  }
}

export function isBotsTurn(gameState: GameState, roomInfo: RoomInfo): boolean {
  const current_player_index = gameState.turn % gameState.players.length
  return (
    roomInfo.players.find(({ bot }, i) => bot && current_player_index === i) !==
    undefined
  )
}

export function isHost(gameState: GameState, playerId: string): boolean {
  return gameState.players.findIndex((player) => player.id === playerId) === 0
}

export function shouldPlayBotTurn(
  gameState: GameState,
  roomInfo: RoomInfo,
  playerId: string
): boolean {
  return isHost(gameState, playerId) && isBotsTurn(gameState, roomInfo)
}

type Coord = { x: number; y: number }
function mul(n: number, p: Coord): Coord {
  return { x: n * p.x, y: n * p.y }
}
function plus(p0: Coord, p1: Coord): Coord {
  return { x: p0.x + p1.x, y: p0.y + p1.y }
}
function minus(p0: Coord, p1: Coord): Coord {
  return { x: p0.x - p1.x, y: p0.y - p1.y }
}
function quadraticBezier(
  p0: Coord,
  p1: Coord,
  p2: Coord
): (t: number) => Coord {
  return (t: number) =>
    plus(
      plus(p1, mul((t - 1) * (t - 1), minus(p0, p1))),
      mul(t * t, minus(p2, p1))
    )
}
export function cubicBezier(
  p0: Coord,
  p1: Coord,
  p2: Coord,
  p3: Coord
): (t: number) => Coord {
  const qb0 = quadraticBezier(p0, p1, p2)
  const qb1 = quadraticBezier(p1, p2, p3)
  return (t: number) => plus(mul(1 - t, qb0(t)), mul(t, qb1(t)))
}
