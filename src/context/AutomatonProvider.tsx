import { useMemo, useReducer } from 'react'
import type { ReactNode } from 'react'
import { cloneDfa } from '../lib/dfa'
import { SAMPLES } from '../lib/samples'
import { AutomatonContext, automatonReducer } from './automaton'

export function AutomatonProvider({ children }: { children: ReactNode }) {
  const [dfa, dispatch] = useReducer(automatonReducer, undefined, () =>
    cloneDfa(SAMPLES[0].dfa),
  )

  const value = useMemo(() => ({ dfa, dispatch }), [dfa])

  return <AutomatonContext.Provider value={value}>{children}</AutomatonContext.Provider>
}
