import { useCallback, useMemo, useState } from 'react'
import type { StateId } from './types/dfa'
import { useAutomaton } from './context/automaton'
import { validateDfa } from './lib/dfa'
import { minimize } from './lib/minimize'
import { colorForBlock, NEUTRAL_COLOR, REMOVED_COLOR, type BlockColor } from './lib/palette'
import { usePlayback } from './hooks/usePlayback'
import { TopBar } from './components/TopBar'
import { ResultDrawer } from './components/ResultDrawer'
import { Toolbar } from './components/Toolbar'
import { TransitionTable } from './components/TransitionTable'
import { Diagram } from './components/Diagram'
import { MorphDiagram } from './components/MorphDiagram'
import { PartitionFlow } from './components/PartitionFlow'
import { ValidationList } from './components/ValidationList'
import { LogoIcon } from './components/icons'

export default function App() {
  const { dfa } = useAutomaton()
  const [drawerOpen, setDrawerOpen] = useState(false)

  const issues = useMemo(() => validateDfa(dfa), [dfa])
  const errors = issues.filter((i) => i.level === 'error')
  const valid = errors.length === 0

  const result = useMemo(() => (valid ? minimize(dfa) : null), [dfa, valid])
  const playback = usePlayback(result?.steps.length ?? 0, result)
  const activeStep = result ? result.steps[playback.index] : null

  const finalBlocks = useMemo(
    () => (result ? result.steps[result.steps.length - 1].partitions : []),
    [result],
  )

  const progress = useMemo(() => {
    if (!result || result.steps.length <= 1) return result ? 1 : 0
    return playback.index / (result.steps.length - 1)
  }, [result, playback.index])

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
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 lg:h-screen lg:flex-row lg:overflow-hidden">
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white lg:w-[340px] lg:border-b-0 lg:border-r">
        <div className="flex shrink-0 items-center gap-3 border-b border-slate-100 px-4 py-3.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shadow-indigo-500/30">
            <LogoIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold text-slate-800">DFA Minimization</h1>
            <p className="truncate text-xs text-slate-400">Moore&apos;s partition refinement</p>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Definition
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                valid
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${valid ? 'bg-emerald-500' : 'bg-red-500'}`}
              />
              {valid ? 'Valid DFA' : `${errors.length} issue${errors.length === 1 ? '' : 's'}`}
            </span>
          </div>

          <div className="space-y-5">
            <Toolbar />
            <TransitionTable />
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          playback={playback}
          total={result?.steps.length ?? 0}
          canPlay={!!result}
          onOpenDrawer={() => setDrawerOpen(true)}
        />

        <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:p-5">
          <div className={`grid gap-4 ${result ? 'md:grid-cols-2' : ''}`}>
            <section className="flex flex-col">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original
                </span>
              </div>
              <div className="min-h-[240px] overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <Diagram
                  dfa={dfa}
                  ariaLabel="Original state diagram"
                  colorForState={colorForState}
                  badgeForState={(state) => badgeMap[state]}
                  highlightStates={highlightStates}
                />
              </div>
            </section>

            <section className="flex flex-col">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Minimized
                </span>
              </div>
              <div className="grid min-h-[240px] place-items-center overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                {result ? (
                  <MorphDiagram
                    original={dfa}
                    minimized={result.minimized}
                    blocks={finalBlocks}
                    progress={progress}
                  />
                ) : (
                  <p className="max-w-[24ch] text-center text-sm text-slate-400">
                    Fix the automaton to run minimization
                  </p>
                )}
              </div>
            </section>
          </div>

          {!valid && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <ValidationList issues={issues} />
            </div>
          )}
        </div>
      </section>

      <aside className="flex w-full shrink-0 flex-col border-t border-slate-200 bg-white lg:w-[400px] lg:border-t-0 lg:border-l">
        <div className="shrink-0 border-b border-slate-100 px-4 py-3.5">
          <h2 className="text-sm font-semibold text-slate-800">Partition refinement</h2>
          <p className="text-xs text-slate-400">Blocks accumulate as states are split</p>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {result && activeStep ? (
            <PartitionFlow steps={result.steps} current={playback.index} dfa={dfa} />
          ) : (
            <p className="text-sm text-slate-500">
              A valid DFA is required to show the refinement animation.
            </p>
          )}
        </div>
      </aside>

      <ResultDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        original={dfa}
        minimized={result?.minimized ?? null}
      />
    </div>
  )
}
