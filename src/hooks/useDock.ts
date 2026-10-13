import { useCallback, useState } from 'react'

export type DockSide = 'top' | 'bottom' | 'left' | 'right'

const SIDES: DockSide[] = ['top', 'bottom', 'left', 'right']

function readDock(key: string, fallback: DockSide): DockSide {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage?.getItem(key)
  return SIDES.includes(raw as DockSide) ? (raw as DockSide) : fallback
}

export function useDock(
  key: string,
  fallback: DockSide,
): [DockSide, (dock: DockSide) => void] {
  const [dock, setDockState] = useState<DockSide>(() => readDock(key, fallback))

  const setDock = useCallback(
    (next: DockSide) => {
      setDockState(next)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem(key, next)
        } catch {
          /* storage unavailable — ignore */
        }
      }
    },
    [key],
  )

  return [dock, setDock]
}
