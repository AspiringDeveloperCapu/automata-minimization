import { useAutomaton } from '../context/automaton'
import { CommitInput } from './CommitInput'

export function SymbolEditor() {
  const { dfa, dispatch } = useAutomaton()

  return (
    <div className="mb-4">
      <div className="mb-1.5 text-xs font-medium text-slate-500">Alphabet (Σ)</div>
      <div className="flex flex-wrap items-center gap-2">
        {dfa.alphabet.map((symbol) => (
          <span
            key={symbol}
            className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-slate-50 px-1.5 py-0.5"
          >
            <CommitInput
              value={symbol}
              ariaLabel={`Rename symbol ${symbol}`}
              onCommit={(to) => dispatch({ type: 'renameSymbol', from: symbol, to })}
              className="mono w-10 bg-transparent px-1 text-sm focus:outline-none"
            />
            <button
              type="button"
              aria-label={`Remove symbol ${symbol}`}
              disabled={dfa.alphabet.length <= 1}
              onClick={() => dispatch({ type: 'removeSymbol', symbol })}
              className="text-slate-400 hover:text-red-500 disabled:opacity-30"
            >
              ×
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => dispatch({ type: 'addSymbol' })}
          className="rounded-md border border-dashed border-slate-300 px-2 py-0.5 text-sm text-slate-500 hover:border-blue-400 hover:text-blue-600"
        >
          + symbol
        </button>
      </div>
    </div>
  )
}
