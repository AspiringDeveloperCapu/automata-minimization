export type StateId = string
export type Symbol = string

export interface DFA {
  states: StateId[]
  alphabet: Symbol[]
  start: StateId
  accepting: StateId[]
  transitions: Record<StateId, Record<Symbol, StateId>>
}

export type IssueLevel = 'error' | 'warning'

export interface ValidationIssue {
  level: IssueLevel
  message: string
}

export type StepKind = 'unreachable' | 'initial' | 'refine' | 'stable'

export interface MinStep {
  kind: StepKind
  partitions: StateId[][]
  description: string
  /** States removed during the unreachable-state preprocessing step. */
  removed?: StateId[]
  /** The block (before this step) that was split, if any. */
  splitBlock?: StateId[]
  /** For each state, the block index its each symbol transitions to. */
  signatures?: Record<StateId, number[]>
}

export interface MinimizationResult {
  steps: MinStep[]
  minimized: DFA
  /** Final block index for each reachable original state. */
  blockOf: Record<StateId, number>
}
