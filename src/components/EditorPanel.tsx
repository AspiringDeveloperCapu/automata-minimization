import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import type { DockSide } from '../hooks/useDock'
import { Toolbar } from './Toolbar'
import { TransitionTable } from './TransitionTable'
import { SymbolEditor } from './SymbolEditor'
import { DockMenu } from './DockMenu'
import { CloseIcon } from './icons'

interface EditorPanelProps {
  dock: DockSide
  onDockChange: (dock: DockSide) => void
  onClose: () => void
  style?: CSSProperties
}

function edgeClass(dock: DockSide) {
  if (dock === 'left') return 'border-r border-line'
  if (dock === 'right') return 'border-l border-line'
  if (dock === 'top') return 'border-b border-line'
  return 'border-t border-line'
}

export function EditorPanel({ dock, onDockChange, onClose, style }: EditorPanelProps) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const column = dock === 'left' || dock === 'right'

  return (
    <aside
      aria-label="Definition editor"
      data-dock={dock}
      style={style}
      className={`flex min-h-0 min-w-0 shrink-0 flex-col bg-surface-2 ${edgeClass(dock)} ${
        column ? 'overflow-hidden' : 'max-h-[50vh] overflow-hidden lg:max-h-none'
      }`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-ink">Definition</h2>
          <p className="truncate text-xs text-ink-faint">States, alphabet and transitions</p>
        </div>
        <DockMenu label="Definition editor" value={dock} onChange={onDockChange} />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close definition editor"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition hover:bg-elevated hover:text-ink"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {column ? (
          <div className="space-y-5">
            <Toolbar />
            <TransitionTable />
          </div>
        ) : (
          <div className="flex items-start gap-6">
            <div className="w-[340px] shrink-0 space-y-4">
              <Toolbar />
              <SymbolEditor />
            </div>
            <div className="min-w-0 flex-1">
              <TransitionTable showSymbols={false} />
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
