export type ClingoResultSatisfiable = {
  Result: 'SATISFIABLE'
  Call: {
    Witnesses: {
      Value: string[]
      Consequences?: any
    }[]
  }[]
}
export type ClingoResultOptimum = {
  Result: 'OPTIMUM FOUND'
  Call: {
    Witnesses: {
      Value: string[]
      Costs: number[]
      Consequences?: any
    }[]
  }[]
}
export type ClingoResult =
  | ClingoResultSatisfiable
  | ClingoResultOptimum
  | {
      Result: 'UNSATISFIABLE' | 'UNKNOWN'
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
