import type { DockSide } from '../hooks/useDock'
import { ArrowBottomIcon, ArrowLeftIcon, ArrowRightIcon, ArrowTopIcon } from './icons'

const OPTIONS: { side: DockSide; label: string; Icon: typeof ArrowTopIcon }[] = [
  { side: 'top', label: 'top', Icon: ArrowTopIcon },
  { side: 'bottom', label: 'bottom', Icon: ArrowBottomIcon },
  { side: 'left', label: 'left', Icon: ArrowLeftIcon },
  { side: 'right', label: 'right', Icon: ArrowRightIcon },
]

interface DockMenuProps {
  label: string
  value: DockSide
  onChange: (dock: DockSide) => void
}

export function DockMenu({ label, value, onChange }: DockMenuProps) {
  return (
    <div role="group" aria-label={`Dock ${label}`} className="flex shrink-0 items-center gap-0.5">
      {OPTIONS.map(({ side, label: sideLabel, Icon }) => (
        <button
          key={side}
          type="button"
          aria-label={`Dock ${label} at ${sideLabel}`}
          aria-pressed={value === side}
          title={`Dock at ${sideLabel}`}
          onClick={() => onChange(side)}
          className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${
            value === side
              ? 'bg-accent/20 text-accent'
              : 'text-ink-faint hover:bg-elevated hover:text-ink'
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  )
}
