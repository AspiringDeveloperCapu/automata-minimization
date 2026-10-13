import { useCallback, useEffect, useMemo, useState } from 'react'
import type { DFA, StateId } from '../types/dfa'
import { simulate } from '../lib/simulate'

export interface Simulator {
  input: string
  setInput: (value: string) => void
  cursor: number
  setCursor: (value: number) => void
  playing: boolean
  toggle: () => void
  step: () => void
  reset: () => void
  atEnd: boolean
  total: number
  /** State the run is in after `cursor` consumed symbols. */
  activeState: StateId | undefined
  /** Transition being taken for the next step (the one just consumed). */
  takenStep: { from: StateId; to: StateId; pulse: number } | undefined
  sim: ReturnType<typeof simulate>
}

/** Drives an input-string simulation over a DFA. */
export function useSimulator(dfa: DFA, speedMs = 650): Simulator {
  const [input, setInput] = useState('')
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(false)

  const sim = useMemo(() => simulate(dfa, input), [dfa, input])
  const steps = sim.steps
  const total = steps.length

  useEffect(() => {
    setCursor(0)
    setPlaying(false)
  }, [sim])

  useEffect(() => {
    if (!playing) return
    if (cursor >= total) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setCursor((c) => Math.min(c + 1, total)), speedMs)
    return () => clearTimeout(id)
  }, [playing, cursor, total, speedMs])

  const step = useCallback(() => {
    setPlaying(false)
    setCursor((c) => Math.min(c + 1, total))
  }, [total])

  const reset = useCallback(() => {
    setPlaying(false)
    setCursor(0)
  }, [])

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && cursor >= total) setCursor(0)
      return !p
    })
  }, [cursor, total])

  const activeState = cursor === 0 ? dfa.start : steps[cursor - 1]?.target
  const previous = cursor > 0 ? steps[cursor - 1] : undefined
  const takenStep =
    previous && previous.ok && previous.target !== undefined
      ? { from: previous.state, to: previous.target, pulse: cursor }
      : undefined

  return {
    input,
    setInput,
    cursor,
    setCursor,
    playing,
    toggle,
    step,
    reset,
    atEnd: cursor >= total,
    total,
    activeState,
    takenStep,
    sim,
  }
}
