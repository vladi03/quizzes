import { useEffect, useState } from 'react'

const MOBILE_QUERY = '(max-width: 720px)'

export function useResponsiveLayout(): 'stack' | 'grid' {
  const [layout, setLayout] = useState<'stack' | 'grid'>(() => {
    if (typeof window === 'undefined') return 'grid'
    return window.matchMedia(MOBILE_QUERY).matches ? 'stack' : 'grid'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const media = window.matchMedia(MOBILE_QUERY)
    const handler = (event: MediaQueryListEvent) =>
      setLayout(event.matches ? 'stack' : 'grid')
    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  return layout
}
