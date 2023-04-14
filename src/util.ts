import type { GameStateMessage, RoomInfoMessage } from './message'

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

export function isBotsTurn(
  gameState: GameStateMessage,
  roomInfo: RoomInfoMessage
): boolean {
  const current_player_index = gameState.turn % gameState.players.length
  return (
    roomInfo.players.find(({ bot }, i) => bot && current_player_index === i) !==
    undefined
  )
}

export function isHost(gameState: GameStateMessage, playerId: string): boolean {
  return gameState.players.findIndex((player) => player.id === playerId) === 0
}

export function shouldPlayBotTurn(
  gameState: GameStateMessage,
  roomInfo: RoomInfoMessage,
  playerId: string
): boolean {
  return isHost(gameState, playerId) && isBotsTurn(gameState, roomInfo)
}
