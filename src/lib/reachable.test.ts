import { describe, expect, it } from 'vitest'
import type { DFA } from '../types/dfa'
import { accepts, withDeadState } from './dfa'
import { reachableStates, removeUnreachable } from './reachable'

const endsWithA: DFA = {
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  start: 'q0',
  accepting: ['q1'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q0' },
  },
}

describe('reachableStates', () => {
  it('finds every reachable state', () => {
    expect(reachableStates(endsWithA)).toEqual(['q0', 'q1'])
  })

  it('ignores unreachable states', () => {
    const dfa: DFA = {
      ...endsWithA,
      states: ['q0', 'q1', 'dead'],
      transitions: {
        ...endsWithA.transitions,
        dead: { a: 'dead', b: 'dead' },
      },
    }
    expect(reachableStates(dfa)).toEqual(['q0', 'q1'])
  })
})

describe('removeUnreachable', () => {
  it('drops unreachable states and keeps valid transitions', () => {
    const dfa: DFA = {
      ...endsWithA,
      states: ['q0', 'q1', 'dead'],
      accepting: ['q1', 'dead'],
      transitions: {
        ...endsWithA.transitions,
        dead: { a: 'dead', b: 'dead' },
      },
    }
    const { dfa: reduced, removed } = removeUnreachable(dfa)
    expect(removed).toEqual(['dead'])
    expect(reduced.states).toEqual(['q0', 'q1'])
    expect(reduced.accepting).toEqual(['q1'])
    expect(Object.keys(reduced.transitions)).toEqual(['q0', 'q1'])
  })
})

describe('accepts', () => {
  it('accepts strings ending in a', () => {
    const words = ['a', 'ba', 'bba', 'abba'].map((w) => [...w])
    for (const w of words) expect(accepts(endsWithA, w)).toBe(true)
    for (const w of [[], ['b'], ['ab'], ['bab']]) {
      expect(accepts(endsWithA, w)).toBe(false)
    }
  })
})

describe('withDeadState', () => {
  it('completes a partial transition function', () => {
    const partial: DFA = {
      states: ['q0'],
      alphabet: ['a', 'b'],
      start: 'q0',
      accepting: [],
      transitions: { q0: { a: 'q0', b: '' } },
    }
    const completed = withDeadState(partial, 'X')
    expect(completed.states).toContain('X')
    expect(completed.transitions.q0.b).toBe('X')
    expect(completed.transitions.X.a).toBe('X')
    expect(completed.transitions.X.b).toBe('X')
  })

  it('leaves complete automata unchanged', () => {
    expect(withDeadState(endsWithA).states).toEqual(['q0', 'q1'])
  })
})
