/**
 * Behavior: Detects user's prefers-reduced-motion setting.
 * When true, all animations should be disabled or instant —
 * no spring rotation, no surface animation, no fade transitions.
 * Listens for live changes via matchMedia event listener.
 */

import { useState, useEffect } from 'react'

export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    function handleChange(event: MediaQueryListEvent): void {
      setPrefersReduced(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReduced
}
