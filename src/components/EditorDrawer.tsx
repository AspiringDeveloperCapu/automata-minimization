import { useEffect } from 'react'
import { Toolbar } from './Toolbar'
import { TransitionTable } from './TransitionTable'
import { CloseIcon } from './icons'

interface EditorDrawerProps {
  open: boolean
  onClose: () => void
}

export function EditorDrawer({ open, onClose }: EditorDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

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
        aria-label="Definition editor"
        className="drawer-enter absolute left-0 top-0 flex h-full w-[min(360px,92vw)] flex-col border-r border-line bg-surface-2 shadow-2xl"
      >
        <header className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-ink">Definition</h2>
            <p className="truncate text-xs text-ink-faint">States, alphabet and transitions</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition hover:bg-elevated hover:text-ink"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="space-y-5">
            <Toolbar />
            <TransitionTable />
          </div>
        </div>
      </aside>
    </div>
  )
}
