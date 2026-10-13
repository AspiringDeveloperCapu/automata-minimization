import type { Playback } from '../hooks/usePlayback'
import { NextIcon, PauseIcon, PlayIcon, PrevIcon, ResetIcon } from './icons'

interface StepControlsProps {
  playback: Playback
  total: number
  disabled?: boolean
}

const iconButton =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500'

export function StepControls({ playback, total, disabled = false }: StepControlsProps) {
  const { index, playing, atEnd, atStart } = playback

  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={index}
        onChange={(event) => playback.setIndex(Number(event.target.value))}
        disabled={disabled}
        aria-label="Step"
        className="step-range w-32 sm:w-44"
      />

      <span className="mono w-11 text-center text-xs tabular-nums text-slate-400">
        {total === 0 ? 0 : index + 1}/{total}
      </span>

      <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          className={iconButton}
          onClick={playback.reset}
          disabled={disabled || (atStart && !playing)}
          aria-label="Reset to first step"
          title="Reset"
        >
          <ResetIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={playback.prev}
          disabled={disabled || atStart}
          aria-label="Previous step"
          title="Previous step"
        >
          <PrevIcon className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={playback.toggle}
          disabled={disabled}
          aria-label={playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          className="inline-flex h-8 items-center gap-1.5 rounded-md bg-indigo-600 px-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {playing ? 'Pause' : atEnd ? 'Replay' : 'Play'}
          </span>
        </button>
        <button
          type="button"
          className={iconButton}
          onClick={playback.next}
          disabled={disabled || atEnd}
          aria-label="Next step"
          title="Next step"
        >
          <NextIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
