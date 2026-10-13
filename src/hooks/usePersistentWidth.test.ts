import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePersistentWidth } from './usePersistentWidth'

const options = { default: 400, min: 320, max: 760 }

describe('usePersistentWidth', () => {
  it('starts at the default width', () => {
    const { result } = renderHook(() => usePersistentWidth('p', options))
    expect(result.current[0]).toBe(400)
  })

  it('clamps values to the given bounds', () => {
    const { result } = renderHook(() => usePersistentWidth('p', options))

    act(() => result.current[1](9999))
    expect(result.current[0]).toBe(760)

    act(() => result.current[1](1))
    expect(result.current[0]).toBe(320)
  })

  it('persists the width to localStorage and restores it', () => {
    const first = renderHook(() => usePersistentWidth('p', options))
    act(() => first.result.current[1](512))
    expect(window.localStorage.getItem('p')).toBe('512')

    const second = renderHook(() => usePersistentWidth('p', options))
    expect(second.result.current[0]).toBe(512)
  })

  it('resets back to the default', () => {
    const { result } = renderHook(() => usePersistentWidth('p', options))
    act(() => result.current[1](700))
    act(() => result.current[2]())
    expect(result.current[0]).toBe(400)
  })
})
