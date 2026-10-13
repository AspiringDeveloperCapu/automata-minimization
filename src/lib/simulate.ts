import type { DFA, StateId, Symbol } from '../types/dfa'

export interface SimStep {
  /** State the run is in before consuming `symbol`. */
  state: StateId
  symbol: string
  /** Resulting state, or undefined when no transition exists. */
  target?: StateId
  ok: boolean
}

export interface Simulation {
  tokens: string[]
  steps: SimStep[]
  finalState: StateId | undefined
  accepted: boolean
  rejected: boolean
  /** True when the run stopped because a transition was missing. */
  halted: boolean
  /** Tokens that are not part of the alphabet. */
  unknown: string[]
}

/**
 * Splits `input` into symbols. If it contains whitespace each token is taken
 * verbatim; otherwise it is matched greedily against the alphabet (longest
 * symbol first) so multi-character symbols work without separators.
 */
export function tokenize(input: string, alphabet: Symbol[]): string[] {
  const trimmed = input.trim()
  if (!trimmed) return []
  if (/\s/.test(trimmed)) return trimmed.split(/\s+/)

  const sorted = [...alphabet].filter(Boolean).sort((a, b) => b.length - a.length)
  const tokens: string[] = []
  let i = 0
  while (i < trimmed.length) {
    let matched = ''
    for (const symbol of sorted) {
      if (trimmed.startsWith(symbol, i)) {
        matched = symbol
        break
      }
    }
    if (matched) {
      tokens.push(matched)
      i += matched.length
    } else {
      tokens.push(trimmed[i])
      i += 1
    }
  }
  return tokens
}

/** Runs a DFA over `input`, stopping at the first missing transition. */
export function simulate(dfa: DFA, input: string): Simulation {
  const tokens = tokenize(input, dfa.alphabet)
  const alphabet = new Set(dfa.alphabet)
  const unknown = new Set<string>()
  const steps: SimStep[] = []

  let state: StateId | undefined = dfa.start
  let halted = false

  for (const symbol of tokens) {
    if (!alphabet.has(symbol)) unknown.add(symbol)
    const target: StateId | undefined =
      state !== undefined ? dfa.transitions[state]?.[symbol] : undefined
    const ok = target !== undefined
    steps.push({ state: state as StateId, symbol, target, ok })
    if (!ok) {
      halted = true
      state = undefined
      break
    }
    state = target
  }

  const completed = !halted && steps.length === tokens.length
  const accepted =
    completed && state !== undefined && dfa.accepting.includes(state)

  return {
    tokens,
    steps,
    finalState: state,
    accepted,
    rejected: !accepted,
    halted,
    unknown: [...unknown],
  }
}
