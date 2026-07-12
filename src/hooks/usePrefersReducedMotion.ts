import { useEffect, useRef, type RefObject } from 'react'

/**
 * Behavior: Tracks the prefers-reduced-motion media query.
 * - Returns a ref (not state) to avoid triggering re-renders.
 * - Updates the ref value when the user changes their system preference.
 * - Designed to be consumed inside rAF loops for motion decisions.
 */
export function usePrefersReducedMotion(): RefObject<boolean> {
  const prefersRef = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersRef.current = mediaQuery.matches

    function handleChange(event: MediaQueryListEvent): void {
      prefersRef.current = event.matches
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersRef
}
