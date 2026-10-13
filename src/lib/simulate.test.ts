import { describe, expect, it } from 'vitest'
import type { DFA } from '../types/dfa'
import { simulate, tokenize } from './simulate'

const dfa: DFA = {
  states: ['q0', 'q1'],
  alphabet: ['a', 'b'],
  start: 'q0',
  accepting: ['q1'],
  transitions: {
    q0: { a: 'q1', b: 'q0' },
    q1: { a: 'q1', b: 'q0' },
  },
}

describe('tokenize', () => {
  it('splits on whitespace verbatim', () => {
    expect(tokenize('ab ba a', ['a', 'b'])).toEqual(['ab', 'ba', 'a'])
  })

  it('greedily matches multi-character symbols', () => {
    expect(tokenize('aab', ['aa', 'a', 'b'])).toEqual(['aa', 'b'])
  })

  it('falls back to single characters', () => {
    expect(tokenize('aab', ['a', 'b'])).toEqual(['a', 'a', 'b'])
  })

  it('returns nothing for blank input', () => {
    expect(tokenize('   ', ['a'])).toEqual([])
  })
})

describe('simulate', () => {
  it('accepts a word ending in a', () => {
    const result = simulate(dfa, 'baba')
    expect(result.accepted).toBe(true)
    expect(result.finalState).toBe('q1')
    expect(result.steps).toHaveLength(4)
  })

  it('rejects a word ending in b', () => {
    const result = simulate(dfa, 'ab')
    expect(result.accepted).toBe(false)
    expect(result.finalState).toBe('q0')
  })

  it('halts on a missing transition', () => {
    const incomplete: DFA = {
      states: ['q0'],
      alphabet: ['a'],
      start: 'q0',
      accepting: [],
      transitions: { q0: {} },
    }
    const result = simulate(incomplete, 'a')
    expect(result.halted).toBe(true)
    expect(result.accepted).toBe(false)
    expect(result.steps[0].ok).toBe(false)
  })

  it('flags unknown symbols', () => {
    const result = simulate(dfa, 'z')
    expect(result.unknown).toEqual(['z'])
    expect(result.halted).toBe(true)
  })

  it('accepts the empty word when the start state is accepting', () => {
    const empty: DFA = { ...dfa, accepting: ['q0'] }
    expect(simulate(empty, '').accepted).toBe(true)
  })
})
