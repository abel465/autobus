import { type CoordWithAngle, inOut } from './util'
import { lastMove, reset_in_progress } from './stores'

import type { AnimationConfig } from 'svelte/animate'
import { cubicOut } from 'svelte/easing'
import { get } from 'svelte/store'

export function animateOpponentHand(
  node: Element,
  _: { from: DOMRect; to: DOMRect },
  {
    i,
    fromCoord,
  }: {
    i: number
    fromCoord: CoordWithAngle
  }
): AnimationConfig {
  const style = getComputedStyle(node)
  const to_angle = (+style.rotate.slice(0, -3) * Math.PI) / 180
  const dangle = to_angle - fromCoord.angle

  const [to_x, _to_y] = style.translate.split(' ').map((s) => +s.slice(0, -2))
  const to_y = _to_y || 0
  const dx = to_x - fromCoord.x
  const dy = to_y - fromCoord.y
  const last_move = get(lastMove)

  if (last_move?.type === 'hand' && i === last_move.card_index) {
    const fy = inOut(450)
    return {
      duration: 900,
      easing: cubicOut,
      css: (_, u) => {
        const angle = to_angle - dangle * u
        const x = to_x - dx * u
        const y = to_y - dy * u + fy(u)
        return `rotate: ${angle}rad; translate: ${x}px ${y}px;`
      },
    }
  } else {
    return {
      delay: 300,
      duration: 500,
      easing: cubicOut,
      css: (_, u) => {
        const angle = to_angle - dangle * u
        const x = to_x - dx * u
        const y = to_y - dy * u
        return `rotate: ${angle}rad; translate: ${x}px ${y}px;`
      },
    }
  }
}

export function animateOwnHand(
  node: Element,
  _: { from: DOMRect; to: DOMRect },
  {
    i,
    fromCoord,
  }: {
    i: number
    fromCoord: CoordWithAngle
  }
): AnimationConfig {
  if (!reset_in_progress.value) {
    return { duration: 0 }
  }
  const style = getComputedStyle(node)
  const to_angle = (+style.rotate.slice(0, -3) * Math.PI) / 180
  const dangle = to_angle - fromCoord.angle

  const [to_x, _to_y] = style.translate.split(' ').map((s) => +s.slice(0, -2))
  const to_y = _to_y || 0
  const dx = to_x - fromCoord.x
  const dy = to_y - fromCoord.y
  const last_move = get(lastMove)

  const fy =
    last_move?.type === 'hand' && i === last_move.card_index
      ? inOut(-450)
      : (_: number) => 0
  return {
    duration: 600,
    easing: cubicOut,
    css: (_, u) => {
      const angle = to_angle - dangle * u
      const x = to_x - dx * u
      const y = to_y - dy * u + fy(u)
      return `rotate: ${angle}rad; translate: ${x}px ${y}px;`
    },
  }
}
