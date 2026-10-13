import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSimulator } from './useSimulator'
import type { DFA } from '../types/dfa'

const loopDfa: DFA = {
  states: ['A', 'B'],
  alphabet: ['0', '1'],
  start: 'A',
  accepting: ['B'],
  transitions: {
    A: { '0': 'A', '1': 'B' },
    B: { '0': 'A', '1': 'B' },
  },
}

describe('useSimulator', () => {
  it('gives each taken step a new pulse id so repeated transitions re-animate', () => {
    const { result } = renderHook(() => useSimulator(loopDfa))
    act(() => result.current.setInput('00'))
    expect(result.current.takenStep).toBeUndefined()

    act(() => result.current.step())
    expect(result.current.takenStep).toMatchObject({ from: 'A', to: 'A', pulse: 1 })

    act(() => result.current.step())
    expect(result.current.takenStep).toMatchObject({ from: 'A', to: 'A', pulse: 2 })
  })

  it('clears the taken step when the input changes', () => {
    const { result } = renderHook(() => useSimulator(loopDfa))
    act(() => result.current.setInput('1'))
    act(() => result.current.step())
    expect(result.current.takenStep).toMatchObject({ from: 'A', to: 'B', pulse: 1 })

    act(() => result.current.setInput('11'))
    expect(result.current.cursor).toBe(0)
    expect(result.current.takenStep).toBeUndefined()
  })
})
