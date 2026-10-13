import { useAutomaton } from '../context/automaton'
import { hasMissingTransitions } from '../lib/dfa'
import { SAMPLES } from '../lib/samples'

export function Toolbar() {
  const { dfa, dispatch } = useAutomaton()
  const canComplete = hasMissingTransitions(dfa)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-faint">
        Load a sample
        <select
          className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-sm text-ink shadow-sm transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          defaultValue={SAMPLES[0].id}
          onChange={(event) => {
            const sample = SAMPLES.find((s) => s.id === event.target.value)
            if (sample) dispatch({ type: 'setDfa', dfa: sample.dfa })
          }}
        >
          {SAMPLES.map((sample) => (
            <option key={sample.id} value={sample.id}>
              {sample.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="button"
        disabled={!canComplete}
        onClick={() => dispatch({ type: 'completeWithDeadState' })}
        className="rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-sm font-medium text-ink-muted shadow-sm transition hover:border-line-strong hover:bg-elevated hover:text-ink disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-surface-1"
        title="Add a dead/sink state to fill in every missing transition"
      >
        Complete with dead state
      </button>
    </div>
  )
}
