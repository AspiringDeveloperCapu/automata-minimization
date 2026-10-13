import { createContext, useContext } from 'react'
import type { Dispatch } from 'react'
import type { DFA, StateId, Symbol } from '../types/dfa'
import { cloneDfa, withDeadState } from '../lib/dfa'

export type AutomatonAction =
  | { type: 'setDfa'; dfa: DFA }
  | { type: 'addState' }
  | { type: 'removeState'; state: StateId }
  | { type: 'renameState'; from: StateId; to: string }
  | { type: 'setStart'; state: StateId }
  | { type: 'toggleAccept'; state: StateId }
  | { type: 'setTransition'; state: StateId; symbol: Symbol; target: StateId }
  | { type: 'addSymbol' }
  | { type: 'removeSymbol'; symbol: Symbol }
  | { type: 'renameSymbol'; from: Symbol; to: string }
  | { type: 'completeWithDeadState' }

export function automatonReducer(dfa: DFA, action: AutomatonAction): DFA {
  switch (action.type) {
    case 'setDfa':
      return cloneDfa(action.dfa)

    case 'addState': {
      const name = uniqueName(`q${dfa.states.length}`, new Set(dfa.states))
      const next = cloneDfa(dfa)
      next.states.push(name)
      next.transitions[name] = {}
      for (const symbol of next.alphabet) next.transitions[name][symbol] = name
      return next
    }

    case 'removeState': {
      if (dfa.states.length <= 1) return dfa
      const next = cloneDfa(dfa)
      next.states = next.states.filter((s) => s !== action.state)
      next.accepting = next.accepting.filter((s) => s !== action.state)
      delete next.transitions[action.state]
      const fallback = next.states[0]
      for (const s of next.states) {
        for (const symbol of next.alphabet) {
          if (next.transitions[s][symbol] === action.state) {
            next.transitions[s][symbol] = fallback
          }
        }
      }
      if (next.start === action.state) next.start = fallback
      return next
    }

    case 'renameState': {
      const to = action.to.trim()
      if (!to || to === action.from) return dfa
      if (dfa.states.includes(to)) return dfa
      const next = cloneDfa(dfa)
      next.states = next.states.map((s) => (s === action.from ? to : s))
      next.accepting = next.accepting.map((s) => (s === action.from ? to : s))
      if (next.start === action.from) next.start = to
      const oldTransitions = next.transitions[action.from]
      delete next.transitions[action.from]
      next.transitions[to] = oldTransitions
      for (const s of next.states) {
        for (const symbol of next.alphabet) {
          if (next.transitions[s][symbol] === action.from) {
            next.transitions[s][symbol] = to
          }
        }
      }
      return next
    }

    case 'setStart': {
      const next = cloneDfa(dfa)
      next.start = action.state
      return next
    }

    case 'toggleAccept': {
      const next = cloneDfa(dfa)
      next.accepting = next.accepting.includes(action.state)
        ? next.accepting.filter((s) => s !== action.state)
        : [...next.accepting, action.state]
      return next
    }

    case 'setTransition': {
      const next = cloneDfa(dfa)
      next.transitions[action.state][action.symbol] = action.target
      return next
    }

    case 'addSymbol': {
      const symbol = uniqueName(nextSymbolName(dfa.alphabet), new Set(dfa.alphabet))
      const next = cloneDfa(dfa)
      next.alphabet.push(symbol)
      for (const s of next.states) next.transitions[s][symbol] = s
      return next
    }

    case 'removeSymbol': {
      if (dfa.alphabet.length <= 1) return dfa
      const next = cloneDfa(dfa)
      next.alphabet = next.alphabet.filter((a) => a !== action.symbol)
      for (const s of next.states) delete next.transitions[s][action.symbol]
      return next
    }

    case 'renameSymbol': {
      const to = action.to.trim()
      if (!to || to === action.from) return dfa
      if (dfa.alphabet.includes(to)) return dfa
      const next = cloneDfa(dfa)
      next.alphabet = next.alphabet.map((a) => (a === action.from ? to : a))
      for (const s of next.states) {
        next.transitions[s][to] = next.transitions[s][action.from]
        delete next.transitions[s][action.from]
      }
      return next
    }

    case 'completeWithDeadState':
      return withDeadState(dfa)

    default:
      return dfa
  }
}

function uniqueName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base
  let i = 1
  while (taken.has(`${base}_${i}`)) i++
  return `${base}_${i}`
}

function nextSymbolName(alphabet: Symbol[]): string {
  for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
    if (!alphabet.includes(ch)) return ch
  }
  return `s${alphabet.length}`
}

export interface AutomatonContextValue {
  dfa: DFA
  dispatch: Dispatch<AutomatonAction>
}

export const AutomatonContext = createContext<AutomatonContextValue | null>(null)

export function useAutomaton(): AutomatonContextValue {
  const ctx = useContext(AutomatonContext)
  if (!ctx) throw new Error('useAutomaton must be used inside AutomatonProvider')
  return ctx
}
