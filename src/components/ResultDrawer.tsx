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
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-label="Result and export"
        className="drawer-enter absolute left-0 top-0 flex h-full w-[min(460px,92vw)] flex-col overflow-y-auto border-r border-line bg-surface-2 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-ink">Result &amp; export</h2>
            <p className="text-xs text-ink-faint">Minimal DFA, copy or download</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ink-faint transition hover:bg-elevated hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="p-4">
          {minimized ? (
            <ResultPanel original={original} minimized={minimized} />
          ) : (
            <p className="text-sm text-ink-muted">
              Fix the automaton to compute a minimal DFA.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}
