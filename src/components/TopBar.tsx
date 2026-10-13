import type { Playback } from '../hooks/usePlayback'
import { DownloadIcon } from './icons'
import { StepControls } from './StepControls'

interface TopBarProps {
  playback: Playback
  total: number
  canPlay: boolean
  onOpenDrawer: () => void
}

export function TopBar({ playback, total, canPlay, onOpenDrawer }: TopBarProps) {
  return (
    <nav className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-surface/80 px-4 py-2.5 backdrop-blur-sm">
      <button
        type="button"
        onClick={onOpenDrawer}
        className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-sm font-medium text-ink-muted shadow-sm transition hover:border-line-strong hover:bg-elevated hover:text-ink"
      >
        <DownloadIcon className="h-4 w-4" />
        Download
      </button>

      <div className="ml-auto min-w-0">
        <StepControls playback={playback} total={total} disabled={!canPlay} />
      </div>
    </nav>
  )
}
