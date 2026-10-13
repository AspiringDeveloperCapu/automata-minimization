import { useAutomaton } from '../context/automaton'
import type { StateId } from '../types/dfa'
import { CommitInput } from './CommitInput'
import { SymbolEditor } from './SymbolEditor'

export function TransitionTable() {
  const { dfa, dispatch } = useAutomaton()

  return (
    <div>
      <SymbolEditor />

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="border-b border-slate-200 px-2 py-2">State</th>
              <th className="border-b border-slate-200 px-2 py-2 text-center">Start</th>
              <th className="border-b border-slate-200 px-2 py-2 text-center">Accept</th>
              {dfa.alphabet.map((symbol) => (
                <th key={symbol} className="mono border-b border-slate-200 px-2 py-2 text-center">
                  {symbol}
                </th>
              ))}
              <th className="border-b border-slate-200 px-2 py-2" />
            </tr>
          </thead>
          <tbody>
            {dfa.states.map((state) => (
              <tr key={state} className="group transition hover:bg-slate-50">
                <td className="border-b border-slate-100 px-1 py-1">
                  <CommitInput
                    value={state}
                    ariaLabel={`State name ${state}`}
                    onCommit={(to) => dispatch({ type: 'renameState', from: state, to })}
                    className="mono w-24 rounded-lg border border-transparent bg-transparent px-1.5 py-1 transition hover:border-slate-200 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-center">
                  <input
                    type="radio"
                    name="start-state"
                    aria-label={`Set ${state} as start`}
                    checked={dfa.start === state}
                    onChange={() => dispatch({ type: 'setStart', state })}
                    className="accent-indigo-600"
                  />
                </td>
                <td className="border-b border-slate-100 px-2 py-1 text-center">
                  <input
                    type="checkbox"
                    aria-label={`Toggle accept for ${state}`}
                    checked={dfa.accepting.includes(state)}
                    onChange={() => dispatch({ type: 'toggleAccept', state })}
                    className="accent-emerald-600"
                  />
                </td>
                {dfa.alphabet.map((symbol) => {
                  const target = dfa.transitions[state]?.[symbol] ?? ''
                  const invalid = target !== '' && !dfa.states.includes(target)
                  return (
                    <td key={symbol} className="border-b border-slate-100 px-1 py-1 text-center">
                      <select
                        value={target}
                        aria-label={`Transition from ${state} on ${symbol}`}
                        onChange={(event) =>
                          dispatch({
                            type: 'setTransition',
                            state,
                            symbol,
                            target: event.target.value,
                          })
                        }
                        className={`mono w-20 rounded-lg border px-1.5 py-1 text-sm transition focus:outline-none focus:ring-2 ${
                          target === ''
                            ? 'border-red-200 bg-red-50 text-red-500 focus:ring-red-500/20'
                            : invalid
                              ? 'border-amber-200 bg-amber-50 focus:ring-amber-500/20'
                              : 'border-slate-200 bg-white focus:border-indigo-500 focus:ring-indigo-500/20'
                        }`}
                      >
                        <option value="">—</option>
                        {dfa.states.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                        {invalid && <option value={target}>{target}?</option>}
                      </select>
                    </td>
                  )
                })}
                <td className="border-b border-slate-100 px-1 py-1 text-center">
                  <button
                    type="button"
                    aria-label={`Remove state ${state}`}
                    disabled={dfa.states.length <= 1}
                    onClick={() => dispatch({ type: 'removeState', state: state as StateId })}
                    className="rounded px-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:text-red-500 disabled:opacity-20"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: 'addState' })}
        className="mt-3 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600"
      >
        + state
      </button>
    </div>
  )
}
