import { useCallback, useRef, useState } from 'react'

interface ResizerProps {
  value: number
  min: number
  max: number
  defaultValue: number
  onChange: (value: number) => void
  onReset?: () => void
  /** When true, dragging right decreases the width (for a right-hand panel). */
  invert?: boolean
  label: string
}

export function Resizer({
  value,
  min,
  max,
  defaultValue,
  onChange,
  onReset,
  invert = false,
  label,
}: ResizerProps) {
  const startRef = useRef<{ x: number; width: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const applyDelta = useCallback(
    (deltaX: number, from: number) => {
      const raw = from + (invert ? -deltaX : deltaX)
      onChange(raw)
    },
    [invert, onChange],
  )

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = { x: event.clientX, width: value }
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const start = startRef.current
    if (!start) return
    applyDelta(event.clientX - start.x, start.width)
  }

  const endDrag = (event: React.PointerEvent) => {
    startRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const step = event.shiftKey ? 48 : 16
    const signedStep = event.key === 'ArrowRight' ? step : -step
    applyDelta(signedStep, value)
  }

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label={label}
      aria-valuenow={Math.round(value)}
      aria-valuemin={min}
      aria-valuemax={max}
      tabIndex={0}
      data-dragging={dragging || undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => (onReset ? onReset() : onChange(defaultValue))}
      title={`${label} — drag or use ←/→ to resize, double-click to reset`}
      className="relative hidden w-px shrink-0 cursor-col-resize touch-none bg-line outline-none transition-colors after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5 after:content-[''] hover:bg-accent/60 focus-visible:bg-accent data-[dragging]:bg-accent lg:block"
    />
  )
}
