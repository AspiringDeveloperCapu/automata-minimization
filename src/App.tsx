import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { StateId } from './types/dfa'
import { useAutomaton } from './context/automaton'
import { validateDfa } from './lib/dfa'
import { minimize } from './lib/minimize'
import { colorForBlock, NEUTRAL_COLOR, REMOVED_COLOR, type BlockColor } from './lib/palette'
import { usePlayback } from './hooks/usePlayback'
import { useMediaQuery } from './hooks/useMediaQuery'
import { usePersistentWidth } from './hooks/usePersistentWidth'
import { useViewportSize } from './hooks/useViewportSize'
import { useDock } from './hooks/useDock'
import { TopBar } from './components/TopBar'
import { ResultDrawer } from './components/ResultDrawer'
import { EditorPanel } from './components/EditorPanel'
import { PartitionPanel } from './components/PartitionPanel'
import { Resizer } from './components/Resizer'
import { GraphPanel } from './components/GraphPanel'
import { PartitionFlow } from './components/PartitionFlow'
import { ValidationList } from './components/ValidationList'

const TOP_BAR_FALLBACK_H = 56

export default function App() {
  const { dfa } = useAutomaton()
  const [editorOpen, setEditorOpen] = useState(false)
  const [resultOpen, setResultOpen] = useState(false)
  const [panelVisible, setPanelVisible] = useState(true)

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [editorDock, setEditorDock] = useDock('layout.v2.editor.dock', 'left')
  const [panelDock, setPanelDock] = useDock('layout.v2.panel.dock', 'right')

  const [editorWidth, setEditorWidth, resetEditorWidth] = usePersistentWidth('layout.v2.editor.width', {
    default: 520,
    min: 320,
    max: 720,
  })
  const [panelWidth, setPanelWidth, resetPanelWidth] = usePersistentWidth('layout.v2.panel.width', {
    default: 520,
    min: 400,
    max: 960,
  })
  const [editorHeight, setEditorHeight, resetEditorHeight] = usePersistentWidth('layout.v2.editor.height', {
    default: 320,
    min: 160,
    max: 560,
  })
  const [panelHeight, setPanelHeight, resetPanelHeight] = usePersistentWidth('layout.v2.panel.height', {
    default: 280,
    min: 160,
    max: 560,
  })

  const viewport = useViewportSize()

  const topBarRef = useRef<HTMLDivElement>(null)
  const [topBarH, setTopBarH] = useState(TOP_BAR_FALLBACK_H)
  useEffect(() => {
    const el = topBarRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const measure = () => {
      const height = el.offsetHeight
      if (height > 0) setTopBarH(height)
    }
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    measure()
    return () => observer.disconnect()
  }, [])

  const editorIsBar = editorDock === 'top' || editorDock === 'bottom'
  const panelIsBar = panelDock === 'top' || panelDock === 'bottom'
  const editorIsCol = editorDock === 'left' || editorDock === 'right'
  const panelIsCol = panelDock === 'left' || panelDock === 'right'

  const graphMinH = Math.max(240, Math.round(viewport.height / 2))
  const maxBarSpace = Math.max(160, viewport.height - topBarH - graphMinH)
  const editorHeightMax = Math.max(160, maxBarSpace - (panelVisible && panelIsBar ? 160 : 0))
  const panelHeightMax = Math.max(160, maxBarSpace - (editorOpen && editorIsBar ? 160 : 0))
  const editorHeightNow = Math.min(editorHeight, editorHeightMax)
  const panelHeightNow = Math.min(panelHeight, panelHeightMax)

  const graphMinW = Math.max(320, Math.round(viewport.width * 0.35))
  const maxColSpace = Math.max(320, viewport.width - graphMinW)
  const editorWidthMax = Math.max(320, maxColSpace - (panelVisible && panelIsCol ? 400 : 0))
  const panelWidthMax = Math.max(400, maxColSpace - (editorOpen && editorIsCol ? 320 : 0))
  const editorWidthNow = Math.min(editorWidth, editorWidthMax)
  const panelWidthNow = Math.min(panelWidth, panelWidthMax)

  const clampSet =
    (setter: (value: number) => void, max: number) => (value: number) =>
      setter(Math.min(value, max))

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

  const partitionBody =
    result && activeStep ? (
      <PartitionFlow steps={result.steps} current={playback.index} dfa={dfa} />
    ) : (
      <ValidationList issues={issues} />
    )

  const editorStyle = (size: number) => (isDesktop ? { [sizeKey(editorDock)]: size } : undefined)
  const panelStyle = (size: number) => (isDesktop ? { [sizeKey(panelDock)]: size } : undefined)

  return (
    <div className="flex min-h-screen flex-col bg-surface text-ink lg:h-screen lg:overflow-hidden">
      <div ref={topBarRef} className="shrink-0">
        <TopBar
          playback={playback}
          total={result?.steps.length ?? 0}
          canPlay={!!result}
          valid={valid}
          errorCount={errors.length}
          panelVisible={panelVisible}
          onToggleEditor={() => setEditorOpen((open) => !open)}
          onOpenResult={() => setResultOpen(true)}
          onTogglePanel={() => setPanelVisible((visible) => !visible)}
        />
      </div>

      {editorOpen && editorDock === 'top' && (
        <>
          <EditorPanel
            dock={editorDock}
            onDockChange={setEditorDock}
            onClose={() => setEditorOpen(false)}
            style={editorStyle(editorHeightNow)}
          />
          <Resizer
            orientation="horizontal"
            label="Resize editor bar"
            value={editorHeightNow}
            min={160}
            max={editorHeightMax}
            defaultValue={320}
            onChange={clampSet(setEditorHeight, editorHeightMax)}
            onReset={resetEditorHeight}
          />
        </>
      )}

      {panelVisible && panelDock === 'top' && (
        <>
          <PartitionPanel
            dock={panelDock}
            onDockChange={setPanelDock}
            style={panelStyle(panelHeightNow)}
          >
            {partitionBody}
          </PartitionPanel>
          <Resizer
            orientation="horizontal"
            label="Resize partition bar"
            value={panelHeightNow}
            min={160}
            max={panelHeightMax}
            defaultValue={280}
            onChange={clampSet(setPanelHeight, panelHeightMax)}
            onReset={resetPanelHeight}
          />
        </>
      )}

      <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-row">
        {editorOpen && editorDock === 'left' && (
          <>
            <EditorPanel
              dock={editorDock}
              onDockChange={setEditorDock}
              onClose={() => setEditorOpen(false)}
              style={editorStyle(editorWidthNow)}
            />
            <Resizer
              label="Resize definition editor"
              value={editorWidthNow}
              min={320}
              max={editorWidthMax}
              defaultValue={520}
              onChange={clampSet(setEditorWidth, editorWidthMax)}
              onReset={resetEditorWidth}
            />
          </>
        )}

        {panelVisible && panelDock === 'left' && (
          <>
            <PartitionPanel
              dock={panelDock}
              onDockChange={setPanelDock}
              style={panelStyle(panelWidthNow)}
            >
              {partitionBody}
            </PartitionPanel>
            <Resizer
              label="Resize partition panel"
              value={panelWidthNow}
              min={400}
              max={panelWidthMax}
              defaultValue={520}
              onChange={clampSet(setPanelWidth, panelWidthMax)}
              onReset={resetPanelWidth}
            />
          </>
        )}

        <main className="relative min-h-0 min-w-0 flex-1">
          <GraphPanel
            original={dfa}
            minimized={result?.minimized ?? null}
            colorForState={colorForState}
            badgeForState={(state) => badgeMap[state]}
            highlightStates={highlightStates}
          />
        </main>

        {panelVisible && panelDock === 'right' && (
          <>
            <Resizer
              invert
              label="Resize animation panel"
              value={panelWidthNow}
              min={400}
              max={panelWidthMax}
              defaultValue={520}
              onChange={clampSet(setPanelWidth, panelWidthMax)}
              onReset={resetPanelWidth}
            />
            <PartitionPanel
              dock={panelDock}
              onDockChange={setPanelDock}
              style={panelStyle(panelWidthNow)}
            >
              {partitionBody}
            </PartitionPanel>
          </>
        )}

        {editorOpen && editorDock === 'right' && (
          <>
            <Resizer
              invert
              label="Resize definition editor"
              value={editorWidthNow}
              min={320}
              max={editorWidthMax}
              defaultValue={520}
              onChange={clampSet(setEditorWidth, editorWidthMax)}
              onReset={resetEditorWidth}
            />
            <EditorPanel
              dock={editorDock}
              onDockChange={setEditorDock}
              onClose={() => setEditorOpen(false)}
              style={editorStyle(editorWidthNow)}
            />
          </>
        )}
      </div>

      {panelVisible && panelDock === 'bottom' && (
        <>
          <Resizer
            orientation="horizontal"
            invert
            label="Resize partition bar"
            value={panelHeightNow}
            min={160}
            max={panelHeightMax}
            defaultValue={280}
            onChange={clampSet(setPanelHeight, panelHeightMax)}
            onReset={resetPanelHeight}
          />
          <PartitionPanel dock={panelDock} onDockChange={setPanelDock} style={panelStyle(panelHeightNow)}>
            {partitionBody}
          </PartitionPanel>
        </>
      )}

      {editorOpen && editorDock === 'bottom' && (
        <>
          <Resizer
            orientation="horizontal"
            invert
            label="Resize editor bar"
            value={editorHeightNow}
            min={160}
            max={editorHeightMax}
            defaultValue={320}
            onChange={clampSet(setEditorHeight, editorHeightMax)}
            onReset={resetEditorHeight}
          />
          <EditorPanel
            dock={editorDock}
            onDockChange={setEditorDock}
            onClose={() => setEditorOpen(false)}
            style={editorStyle(editorHeightNow)}
          />
        </>
      )}

      <ResultDrawer
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        original={dfa}
        minimized={result?.minimized ?? null}
      />
    </div>
  )
}

function sizeKey(dock: 'top' | 'bottom' | 'left' | 'right') {
  return dock === 'top' || dock === 'bottom' ? 'height' : 'width'
}
