import { describe, expect, it } from 'vitest'
import type { DFA, Symbol } from '../types/dfa'
import { accepts } from './dfa'
import { minimize } from './minimize'
import { SAMPLES } from './samples'

function allStrings(alphabet: Symbol[], maxLength: number): Symbol[][] {
  const out: Symbol[][] = [[]]
  for (let len = 1; len <= maxLength; len++) {
    const previous = out.filter((w) => w.length === len - 1)
    for (const word of previous) {
      for (const symbol of alphabet) out.push([...word, symbol])
    }
  }
  return out
}

function languagesAgree(a: DFA, b: DFA, maxLength = 6): boolean {
  for (const word of allStrings(a.alphabet, maxLength)) {
    if (accepts(a, word) !== accepts(b, word)) return false
  }
  return true
}

const redundant: DFA = {
  states: ['q0', 'q1', 'q2', 'q3'],
  alphabet: ['a', 'b'],
  start: 'q0',
  accepting: ['q1', 'q2'],
  transitions: {
    q0: { a: 'q1', b: 'q2' },
    q1: { a: 'q1', b: 'q3' },
    q2: { a: 'q1', b: 'q3' },
    q3: { a: 'q3', b: 'q3' },
  },
}

describe('minimize', () => {
  it('merges equivalent states', () => {
    const { minimized } = minimize(redundant)
    expect(minimized.states).toHaveLength(3)
    expect(languagesAgree(redundant, minimized)).toBe(true)
  })

  it('records the expected phases', () => {
    const { steps } = minimize(redundant)
    expect(steps[0].kind).toBe('unreachable')
    expect(steps[1].kind).toBe('initial')
    expect(steps.at(-1)?.kind).toBe('stable')
    expect(steps.some((s) => s.kind === 'refine')).toBe(true)
  })

  it('does not change an already minimal DFA', () => {
    const endsWithA = SAMPLES.find((s) => s.id === 'ends-with-a')!.dfa
    const { minimized } = minimize(endsWithA)
    expect(minimized.states).toHaveLength(2)
    expect(languagesAgree(endsWithA, minimized)).toBe(true)
    // no refine rounds needed
    expect(minimize(endsWithA).steps.some((s) => s.kind === 'refine')).toBe(false)
  })

  it('removes unreachable states before partitioning', () => {
    const sample = SAMPLES.find((s) => s.id === 'unreachable')!.dfa
    const { steps, minimized } = minimize(sample)
    expect(steps[0].removed).toEqual(['q2'])
    expect(minimized.states).not.toContain('q2')
    expect(languagesAgree(sample, minimized)).toBe(true)
  })

  it('is idempotent', () => {
    const once = minimize(redundant).minimized
    const twice = minimize(once).minimized
    expect(twice.states).toHaveLength(once.states.length)
  })

  it('collapses an all-accepting DFA to one state', () => {
    const allAccept: DFA = {
      states: ['q0', 'q1'],
      alphabet: ['a'],
      start: 'q0',
      accepting: ['q0', 'q1'],
      transitions: { q0: { a: 'q0' }, q1: { a: 'q1' } },
    }
    expect(minimize(allAccept).minimized.states).toHaveLength(1)
  })

  it('collapses an all-rejecting DFA to one state', () => {
    const allReject: DFA = {
      states: ['q0', 'q1'],
      alphabet: ['a'],
      start: 'q0',
      accepting: [],
      transitions: { q0: { a: 'q1' }, q1: { a: 'q0' } },
    }
    const { minimized } = minimize(allReject)
    expect(minimized.states).toHaveLength(1)
    expect(minimized.accepting).toHaveLength(0)
  })

  it('preserves the language of every bundled sample', () => {
    for (const sample of SAMPLES) {
      const { minimized } = minimize(sample.dfa)
      expect(
        languagesAgree(sample.dfa, minimized),
        `sample ${sample.id} changed language`,
      ).toBe(true)
    }
  })

  it('groups equivalent states into the same block', () => {
    const { blockOf } = minimize(redundant)
    expect(blockOf['q1']).toBe(blockOf['q2'])
    expect(blockOf['q0']).not.toBe(blockOf['q1'])
    expect(blockOf['q3']).not.toBe(blockOf['q0'])
  })
})
