import { useCallback, useEffect, useRef, useState } from 'react'

interface ResizerProps {
  value: number
  min: number
  max: number
  defaultValue: number
  onChange: (value: number) => void
  onReset?: () => void
  /** When true, dragging away from the panel decreases its size. */
  invert?: boolean
  orientation?: 'vertical' | 'horizontal'
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
  orientation = 'vertical',
  label,
}: ResizerProps) {
  const startRef = useRef<{ axis: number; size: number } | null>(null)
  const [dragging, setDragging] = useState(false)

  const horizontal = orientation === 'horizontal'

  const prevOrientation = useRef(orientation)
  useEffect(() => {
    if (prevOrientation.current !== orientation) {
      startRef.current = null
      setDragging(false)
      prevOrientation.current = orientation
    }
  }, [orientation])

  const applyDelta = useCallback(
    (delta: number, from: number) => {
      const raw = from + (invert ? -delta : delta)
      onChange(raw)
    },
    [invert, onChange],
  )

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    startRef.current = { axis: horizontal ? event.clientY : event.clientX, size: value }
    setDragging(true)
  }

  const handlePointerMove = (event: React.PointerEvent) => {
    const start = startRef.current
    if (!start) return
    const axis = horizontal ? event.clientY : event.clientX
    applyDelta(axis - start.axis, start.size)
  }

  const endDrag = (event: React.PointerEvent) => {
    startRef.current = null
    setDragging(false)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const decreaseKey = horizontal ? 'ArrowUp' : 'ArrowLeft'
    const increaseKey = horizontal ? 'ArrowDown' : 'ArrowRight'
    if (event.key !== decreaseKey && event.key !== increaseKey) return
    event.preventDefault()
    const step = event.shiftKey ? 48 : 16
    const signedStep = event.key === increaseKey ? step : -step
    applyDelta(signedStep, value)
  }

  const orientationClass = horizontal
    ? `relative hidden h-px w-full cursor-row-resize touch-none bg-line transition-colors after:absolute after:-bottom-1.5 after:-top-1.5 after:inset-x-0 after:content-[''] hover:bg-accent/60 focus-visible:bg-accent data-[dragging]:bg-accent lg:block`
    : `relative hidden w-px shrink-0 cursor-col-resize touch-none bg-line transition-colors after:absolute after:inset-y-0 after:-left-1.5 after:-right-1.5 after:content-[''] hover:bg-accent/60 focus-visible:bg-accent data-[dragging]:bg-accent lg:block`

  return (
    <div
      role="separator"
      aria-orientation={horizontal ? 'horizontal' : 'vertical'}
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
      title={`${label} — drag or use arrow keys to resize, double-click to reset`}
      className={`shrink-0 outline-none ${orientationClass}`}
    />
  )
}
