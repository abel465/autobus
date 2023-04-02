import type { run } from 'clingo-wasm'

export type Clingo = {
  init: (path: string) => Promise<void>
  run: typeof run
}

declare global {
  interface Window {
    clingo: Clingo
  }
}
