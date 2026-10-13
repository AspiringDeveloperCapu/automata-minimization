import { useCallback, useRef, useState } from 'react'

interface WidthOptions {
  /** Width used when nothing is stored yet. */
  default: number
  min: number
  max: number
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value))
}

function readStored(key: string, fallback: number) {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage?.getItem(key)
  if (raw === null || raw === undefined || raw === '') return fallback
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

/**
 * A pixel width persisted in localStorage and clamped to [min, max].
 * Returns `[width, setWidth, reset]`.
 */
export function usePersistentWidth(
  key: string,
  { default: initial, min, max }: WidthOptions,
): [number, (value: number) => void, () => void] {
  const [width, setWidthState] = useState(() =>
    clamp(readStored(key, initial), min, max),
  )

  const bounds = useRef({ min, max })
  bounds.current = { min, max }

  const setWidth = useCallback(
    (value: number) => {
      const next = clamp(value, bounds.current.min, bounds.current.max)
      setWidthState(next)
      if (typeof window !== 'undefined') {
        try {
          window.localStorage?.setItem(key, String(Math.round(next)))
        } catch {
          /* storage unavailable — ignore */
        }
      }
    },
    [key],
  )

  const reset = useCallback(() => setWidth(initial), [setWidth, initial])

  return [width, setWidth, reset]
}
