import type { DFA, StateId } from '../types/dfa'
import { cloneDfa } from './dfa'

/** States reachable from the start state, preserving the original declaration order. */
export function reachableStates(dfa: DFA): StateId[] {
  const seen = new Set<StateId>()
  const queue: StateId[] = [dfa.start]
  while (queue.length) {
    const state = queue.shift() as StateId
    if (seen.has(state)) continue
    seen.add(state)
    for (const symbol of dfa.alphabet) {
      const target = dfa.transitions[state]?.[symbol]
      if (target !== undefined && !seen.has(target)) queue.push(target)
    }
  }
  return dfa.states.filter((s) => seen.has(s))
}

export interface UnreachableResult {
  dfa: DFA
  reachable: StateId[]
  removed: StateId[]
}

/** Drop states that cannot be reached from the start state. */
export function removeUnreachable(dfa: DFA): UnreachableResult {
  const reachable = reachableStates(dfa)
  const reachableSet = new Set(reachable)
  const removed = dfa.states.filter((s) => !reachableSet.has(s))

  const next = cloneDfa(dfa)
  next.states = reachable
  next.accepting = dfa.accepting.filter((s) => reachableSet.has(s))
  const transitions: DFA['transitions'] = {}
  for (const s of reachable) transitions[s] = { ...(dfa.transitions[s] ?? {}) }
  next.transitions = transitions

  return { dfa: next, reachable, removed }
}
