import { useCallback, useEffect, useState } from 'react'

export interface Playback {
  index: number
  setIndex: (i: number) => void
  playing: boolean
  toggle: () => void
  next: () => void
  prev: () => void
  reset: () => void
  atEnd: boolean
  atStart: boolean
}

/**
 * Drives a step-by-step animation over `total` steps. Resets to step 0
 * whenever `resetKey` changes (e.g. a new minimization result).
 */
export function usePlayback(total: number, resetKey: unknown, speedMs = 1000): Playback {
  const [index, setIndexRaw] = useState(0)
  const [playing, setPlaying] = useState(false)
  const last = Math.max(0, total - 1)

  useEffect(() => {
    setIndexRaw(0)
    setPlaying(false)
  }, [resetKey])

  useEffect(() => {
    setIndexRaw((i) => Math.min(i, last))
  }, [last])

  useEffect(() => {
    if (!playing) return
    if (index >= last) {
      setPlaying(false)
      return
    }
    const id = setTimeout(() => setIndexRaw((i) => Math.min(i + 1, last)), speedMs)
    return () => clearTimeout(id)
  }, [playing, index, last, speedMs])

  const setIndex = useCallback(
    (i: number) => {
      setPlaying(false)
      setIndexRaw(Math.max(0, Math.min(i, last)))
    },
    [last],
  )

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p && index >= last) setIndexRaw(0)
      return !p
    })
  }, [index, last])

  const next = useCallback(() => {
    setPlaying(false)
    setIndexRaw((i) => Math.min(i + 1, last))
  }, [last])

  const prev = useCallback(() => {
    setPlaying(false)
    setIndexRaw((i) => Math.max(i - 1, 0))
  }, [])

  const reset = useCallback(() => {
    setPlaying(false)
    setIndexRaw(0)
  }, [])

  return {
    index,
    setIndex,
    playing,
    toggle,
    next,
    prev,
    reset,
    atEnd: index >= last,
    atStart: index <= 0,
  }
}
