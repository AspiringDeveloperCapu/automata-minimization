import type { DFA } from '../types/dfa'
import { ResultPanel } from './ResultPanel'
import { CloseIcon } from './icons'

interface ResultDrawerProps {
  open: boolean
  onClose: () => void
  original: DFA
  minimized: DFA | null
}

export function ResultDrawer({ open, onClose, original, minimized }: ResultDrawerProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Result and export"
        className="drawer-enter absolute left-0 top-0 flex h-full w-[min(460px,92vw)] flex-col overflow-y-auto border-r border-slate-200 bg-white shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Result &amp; export</h2>
            <p className="text-xs text-slate-400">Minimal DFA, copy or download</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="p-4">
          {minimized ? (
            <ResultPanel original={original} minimized={minimized} />
          ) : (
            <p className="text-sm text-slate-500">
              Fix the automaton to compute a minimal DFA.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}
