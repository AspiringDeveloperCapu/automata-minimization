import { useCallback, useMemo, useState } from 'react'
import type { StateId } from './types/dfa'
import { useAutomaton } from './context/automaton'
import { validateDfa } from './lib/dfa'
import { minimize } from './lib/minimize'
import { colorForBlock, NEUTRAL_COLOR, REMOVED_COLOR, type BlockColor } from './lib/palette'
import { usePlayback } from './hooks/usePlayback'
import { useMediaQuery } from './hooks/useMediaQuery'
import { usePersistentWidth } from './hooks/usePersistentWidth'
import { TopBar } from './components/TopBar'
import { ResultDrawer } from './components/ResultDrawer'
import { EditorDrawer } from './components/EditorDrawer'
import { Resizer } from './components/Resizer'
import { GraphPanel } from './components/GraphPanel'
import { PartitionFlow } from './components/PartitionFlow'
import { ValidationList } from './components/ValidationList'

export default function App() {
  const { dfa } = useAutomaton()
  const [editorOpen, setEditorOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [panelVisible, setPanelVisible] = useState(true)

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [rightWidth, setRightWidth, resetRightWidth] = usePersistentWidth('panel.right', {
    default: 400,
    min: 320,
    max: 760,
  })

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
    <div className="flex min-h-screen flex-col bg-surface text-ink lg:h-screen lg:flex-row lg:overflow-hidden">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col">
        <TopBar
          playback={playback}
          total={result?.steps.length ?? 0}
          canPlay={!!result}
          valid={valid}
          errorCount={errors.length}
          panelVisible={panelVisible}
          onOpenEditor={() => setEditorOpen(true)}
          onOpenResult={() => setResultOpen(true)}
          onTogglePanel={() => setPanelVisible((visible) => !visible)}
        />

        <div className="relative min-h-0 flex-1">
          <GraphPanel
            original={dfa}
            minimized={result?.minimized ?? null}
            colorForState={colorForState}
            badgeForState={(state) => badgeMap[state]}
            highlightStates={highlightStates}
          />
        </div>
      </section>

      {panelVisible && (
        <>
          <Resizer
            label="Resize animation panel"
            value={rightWidth}
            min={320}
            max={760}
            defaultValue={400}
            onChange={setRightWidth}
            onReset={resetRightWidth}
            invert
          />

          <aside
            className="flex w-full shrink-0 flex-col border-t border-line bg-surface-2 lg:border-t-0 lg:border-l"
            style={isDesktop ? { width: rightWidth } : undefined}
          >
            <div className="shrink-0 border-b border-line px-4 py-3.5">
              <h2 className="text-sm font-semibold text-ink">Partition refinement</h2>
              <p className="text-xs text-ink-faint">Blocks accumulate as states are split</p>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {result && activeStep ? (
                <PartitionFlow steps={result.steps} current={playback.index} dfa={dfa} />
              ) : (
                <ValidationList issues={issues} />
              )}
            </div>
          </aside>
        </>
      )}

      <EditorDrawer open={editorOpen} onClose={() => setEditorOpen(false)} />

      <ResultDrawer
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        original={dfa}
        minimized={result?.minimized ?? null}
      />
    </div>
  )
}
