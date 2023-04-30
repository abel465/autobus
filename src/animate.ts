import { type CoordWithAngle, inOut } from './util'
import { lastMove } from './stores'

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
    fromCoord: CoordWithAngle
    i: number
  }
): AnimationConfig {
  const style = getComputedStyle(node)
  const to_angleDeg = +style.rotate.slice(0, -3)
  const to_angle = (to_angleDeg * Math.PI) / 180
  const dangle = to_angle - fromCoord.angle

  const [to_x, _to_y] = style.translate.split(' ').map((s) => +s.slice(0, -2))
  const to_y = _to_y || 0
  const dx = to_x - fromCoord.x
  const dy = to_y - fromCoord.y
  const last_move = get(lastMove)

  if (last_move.type === 'hand' && i === last_move.card_index) {
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

// import { flip } from 'svelte/animate';
// export function extendFlip(fn: Function) {
//   return (node: Element, animations, params = {}) => {
//     let flipRes = flip(node, animations, params);
//     let transitionRes = fn(node, params);
//
//     let getTransform = (str: string) => {
//       let results = str.match(/transform: (.*);/);
//       if (results && results.length) {
//         return results[results.length - 1];
//       }
//       return '';
//     };
//
//     let mergeTransform = (css1: string, css2: string) => {
//       return `transform: ${getTransform(css1)} ${getTransform(css2)};`;
//     };
//
//     return {
//       ...flipRes,
//       css: (t, u) =>
//         `${transitionRes.css(t, u)}; ${mergeTransform(
//           flipRes.css(t, u),
//           transitionRes.css(t, u),
//         )};`,
//     };
//   };
// }
