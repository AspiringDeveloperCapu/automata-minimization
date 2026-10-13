import type { Playback } from '../hooks/usePlayback'
import { DownloadIcon, MenuIcon, PanelIcon } from './icons'
import { StepControls } from './StepControls'

interface TopBarProps {
  playback: Playback
  total: number
  canPlay: boolean
  valid: boolean
  errorCount: number
  panelVisible: boolean
  onOpenEditor: () => void
  onOpenResult: () => void
  onTogglePanel: () => void
}

export function TopBar({
  playback,
  total,
  canPlay,
  valid,
  errorCount,
  panelVisible,
  onOpenEditor,
  onOpenResult,
  onTogglePanel,
}: TopBarProps) {
  return (
    <nav className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface/80 px-4 py-2.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={onOpenEditor}
        aria-label="Open definition editor"
        title="Definition editor"
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition hover:bg-elevated hover:text-ink"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="min-w-0 leading-tight">
        <h1 className="truncate text-sm font-semibold text-ink">DFA Minimization</h1>
        <p className="hidden truncate text-xs text-ink-faint sm:block">
          Moore&apos;s partition refinement
        </p>
      </div>

      <span
        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          valid ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger'
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${valid ? 'bg-success' : 'bg-danger'}`} />
        {valid ? 'Valid DFA' : `${errorCount} issue${errorCount === 1 ? '' : 's'}`}
      </span>

      <div className="ml-auto flex min-w-0 flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onOpenResult}
          className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-sm font-medium text-ink-muted shadow-sm transition hover:border-line-strong hover:bg-elevated hover:text-ink"
        >
          <DownloadIcon className="h-4 w-4" />
          Download
        </button>

        <button
          type="button"
          onClick={onTogglePanel}
          aria-label={panelVisible ? 'Hide partition panel' : 'Show partition panel'}
          aria-pressed={panelVisible}
          title={panelVisible ? 'Hide partition panel' : 'Show partition panel'}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-md border shadow-sm transition ${
            panelVisible
              ? 'border-line bg-surface-1 text-ink-muted hover:border-line-strong hover:bg-elevated hover:text-ink'
              : 'border-accent/40 bg-accent/15 text-accent hover:bg-accent/25'
          }`}
        >
          <PanelIcon className="h-4 w-4" />
        </button>

        <div className="min-w-0">
          <StepControls playback={playback} total={total} disabled={!canPlay} />
        </div>
      </div>
    </nav>
  )
}
