export type ClingoResult = {
  Result: 'SATISFIABLE' | 'UNSATISFIABLE' | 'UNKNOWN' | 'OPTIMUM FOUND'
  Call: {
    Witnesses: {
      Value: string[]
      Costs?: number[]
      Consequences?: any
    }[]
  }[]
}

export type Clingo = {
  init: (path: string) => Promise<void>
  run: (
    program: string,
    models: number = 1,
    options: string[] = []
  ) => Promise<ClingoResult>
}

declare global {
  interface Window {
    clingo: Clingo
  }
}
