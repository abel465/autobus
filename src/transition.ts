import { cubicIn } from 'svelte/easing'
import type { TransitionConfig } from 'svelte/transition'

export function bezier(
  node: Element,
  {
    delay = 0,
    duration = 400,
    easing = cubicIn,
    bezier = (_: number) => ({ x: 0, y: 0 }),
  }
): TransitionConfig {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform
  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      const p = bezier(t)
      return `transform: ${transform} translate(${p.x}px, ${p.y}px);`
    },
  }
}

export function bezierWithRotation(
  node: Element,
  {
    delay = 0,
    duration = 400,
    easing = cubicIn,
    bezier = (_: number) => ({ x: 0, y: 0 }),
    angle = 0,
  }
): TransitionConfig {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform
  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      const p = bezier(t)
      return `transform: ${transform} translate(${p.x}px, ${p.y}px) rotate(${
        (1 - t) * angle
      }rad);`
    },
  }
}

export function flyWithRotation(
  node: Element,
  { delay = 0, duration = 400, easing = cubicIn, x = 0, y = 0, angle = 0 }
): TransitionConfig {
  const style = getComputedStyle(node)
  const transform = style.transform === 'none' ? '' : style.transform
  return {
    delay,
    duration,
    easing,
    css: (t: number) => {
      return `transform: ${transform} rotate(${(1 - t) * angle}rad) translate(${
        (1 - t) * x
      }px, ${(1 - t) * y}px);`
    },
  }
}
