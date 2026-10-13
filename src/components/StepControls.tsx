import type { Playback } from '../hooks/usePlayback'

interface StepControlsProps {
  playback: Playback
  total: number
}

const buttonClass =
  'rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40'

export function StepControls({ playback, total }: StepControlsProps) {
  const { index, playing, atEnd, atStart } = playback

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          className={buttonClass}
          onClick={playback.reset}
          disabled={atStart && !playing}
          aria-label="Reset to first step"
        >
          ⏮
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={playback.prev}
          disabled={atStart}
          aria-label="Previous step"
        >
          ◀
        </button>
        <button
          type="button"
          className="rounded-md bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          onClick={playback.toggle}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚ Pause' : atEnd ? '↺ Replay' : '▶ Play'}
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={playback.next}
          disabled={atEnd}
          aria-label="Next step"
        >
          ▶
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={index}
        onChange={(event) => playback.setIndex(Number(event.target.value))}
        aria-label="Step"
        className="h-2 min-w-40 flex-1 accent-blue-600"
      />

      <span className="mono text-xs text-slate-500">
        Step {total === 0 ? 0 : index + 1}/{total}
      </span>
    </div>
  )
}
