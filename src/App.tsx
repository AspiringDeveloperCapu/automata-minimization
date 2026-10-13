import { useCallback, useMemo } from 'react'
import type { StateId } from './types/dfa'
import { useAutomaton } from './context/automaton'
import { validateDfa } from './lib/dfa'
import { minimize } from './lib/minimize'
import { colorForBlock, NEUTRAL_COLOR, REMOVED_COLOR, type BlockColor } from './lib/palette'
import { usePlayback } from './hooks/usePlayback'
import { Card } from './components/Card'
import { Toolbar } from './components/Toolbar'
import { TransitionTable } from './components/TransitionTable'
import { Diagram } from './components/Diagram'
import { PartitionView } from './components/PartitionView'
import { StepControls } from './components/StepControls'
import { ResultPanel } from './components/ResultPanel'
import { ValidationList } from './components/ValidationList'

export default function App() {
  const { dfa } = useAutomaton()

  const issues = useMemo(() => validateDfa(dfa), [dfa])
  const errors = issues.filter((i) => i.level === 'error')
  const valid = errors.length === 0

  const result = useMemo(() => (valid ? minimize(dfa) : null), [dfa, valid])
  const playback = usePlayback(result?.steps.length ?? 0, result)
  const activeStep = result ? result.steps[playback.index] : null

  const { colorMap, badgeMap } = useMemo(() => {
    const colors: Record<StateId, BlockColor> = {}
    const badges: Record<StateId, string> = {}
    activeStep?.partitions.forEach((block, index) => {
      for (const state of block) {
        colors[state] = colorForBlock(index)
        badges[state] = String(index + 1)
      }
    })
    return { colorMap: colors, badgeMap: badges }
  }, [activeStep])

  const colorForState = useCallback(
    (state: StateId) => colorMap[state] ?? (result ? REMOVED_COLOR : NEUTRAL_COLOR),
    [colorMap, result],
  )

  const highlightStates = useMemo(
    () => (activeStep?.splitBlock ? new Set(activeStep.splitBlock) : undefined),
    [activeStep],
  )

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-800">DFA Minimization</h1>
            <p className="text-xs text-slate-400">
              Moore&apos;s partition refinement, animated step by step
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              valid
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-600'
            }`}
          >
            {valid ? 'Valid DFA' : `${errors.length} issue${errors.length === 1 ? '' : 's'}`}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card title="Transition table" subtitle="Define states, alphabet and δ" bodyClassName="">
            <div className="space-y-4">
              <Toolbar />
              <TransitionTable />
            </div>
          </Card>

          <Card title="State diagram" subtitle="Colors track the current partition">
            <div className="overflow-x-auto">
              <Diagram
                dfa={dfa}
                colorForState={colorForState}
                badgeForState={(state) => badgeMap[state]}
                highlightStates={highlightStates}
              />
            </div>
          </Card>
        </div>

        {valid && result && activeStep ? (
          <>
            <Card title="Minimization" subtitle="Step through the refinement">
              <div className="space-y-4">
                <StepControls playback={playback} total={result.steps.length} />
                <PartitionView step={activeStep} dfa={dfa} />
              </div>
            </Card>

            <Card title="Minimal DFA" subtitle="Final result">
              <ResultPanel original={dfa} minimized={result.minimized} />
            </Card>
          </>
        ) : (
          <Card title="Minimization">
            <ValidationList issues={issues} />
          </Card>
        )}
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-2 text-center text-xs text-slate-400">
        Automata Theory — DFA minimization demo
      </footer>
    </div>
  )
}
