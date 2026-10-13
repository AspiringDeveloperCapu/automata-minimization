import { useEffect, useState } from 'react'

interface ViewportSize {
  width: number
  height: number
}

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>(() => ({
    width: typeof window === 'undefined' ? 0 : window.innerWidth,
    height: typeof window === 'undefined' ? 0 : window.innerHeight,
  }))

  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return size
}
