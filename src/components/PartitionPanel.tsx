import type { CSSProperties, ReactNode } from 'react'
import type { DockSide } from '../hooks/useDock'
import { DockMenu } from './DockMenu'

interface PartitionPanelProps {
  dock: DockSide
  onDockChange: (dock: DockSide) => void
  children: ReactNode
  style?: CSSProperties
}

function edgeClass(dock: DockSide) {
  if (dock === 'left') return 'border-r border-line'
  if (dock === 'right') return 'border-l border-line'
  if (dock === 'top') return 'border-b border-line'
  return 'border-t border-line'
}

export function PartitionPanel({ dock, onDockChange, children, style }: PartitionPanelProps) {
  const column = dock === 'left' || dock === 'right'

  return (
    <aside
      aria-label="Partition refinement panel"
      data-dock={dock}
      style={style}
      className={`flex min-h-0 min-w-0 shrink-0 flex-col bg-surface-2 ${edgeClass(dock)} ${
        column ? '' : 'max-h-[50vh] lg:max-h-none'
      }`}
    >
      <header className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold text-ink">Partition refinement</h2>
          <p className="truncate text-xs text-ink-faint">Blocks accumulate as states are split</p>
        </div>
        <DockMenu label="Partition refinement panel" value={dock} onChange={onDockChange} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
    </aside>
  )
}
