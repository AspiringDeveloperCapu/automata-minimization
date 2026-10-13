import { useAutomaton } from '../context/automaton'
import { hasMissingTransitions } from '../lib/dfa'
import { SAMPLES } from '../lib/samples'

export function Toolbar() {
  const { dfa, dispatch } = useAutomaton()
  const canComplete = hasMissingTransitions(dfa)

  return (
    <div className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
        Load a sample
        <select
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-700 shadow-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
        title="Add a dead/sink state to fill in every missing transition"
      >
        Complete with dead state
      </button>
    </div>
  )
}
