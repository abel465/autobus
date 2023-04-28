import { cubicOut } from 'svelte/easing'
import type { AnimationConfig } from 'svelte/animate'
import { get } from 'svelte/store'

import { opponentHandTransition } from './stores'
import { inOut } from './util'

export function animateOpponentHand(
  node: Element,
  _: { from: DOMRect; to: DOMRect },
  params: {
    fromCoord: { x: number; y: number; angle: number }
    i: number
  }
): AnimationConfig {
  const style = getComputedStyle(node)
  const from_coord = params.fromCoord
  const to_angleDeg = +style.rotate.slice(0, -3)
  const to_angle = (to_angleDeg * Math.PI) / 180
  const dangle = to_angle - from_coord.angle

  console.log(style.translate)
  const [to_x, _to_y] = style.translate.split(' ').map((s) => +s.slice(0, -2))
  const to_y = _to_y || 0
  const dx = to_x - from_coord.x
  const dy = to_y - from_coord.y
  const is_target = params.i === get(opponentHandTransition).from_index
  const fy = is_target ? inOut(450) : (_: number) => 0

  const {
    delay,
    duration,
    easing = cubicOut,
  } = is_target
    ? {
        delay: 0,
        duration: 900,
      }
    : {
        delay: 300,
        duration: 500,
      }

  return {
    delay,
    duration,
    easing,
    css: (_, u) => {
      const angle = to_angle - dangle * u
      const x = to_x - dx * u
      const y = to_y - dy * u + fy(u)
      return `rotate: ${angle}rad; translate: ${x}px ${y}px;`
    },
  }
}
