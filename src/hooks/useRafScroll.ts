import { useEffect, useRef } from 'react'

/**
 * Number of rAF frames to continue after the last scroll event.
 * Allows lerp-based smoothing to converge even after scrolling stops.
 * At 60 fps this gives ~1 second of settling time.
 */
const SETTLE_FRAMES = 60

/**
 * Behavior: Provides rAF-throttled scroll position updates.
 * - Listens to window scroll events with passive mode (never blocks scrolling).
 * - On each scroll, starts a rAF loop that calls the callback every frame.
 * - The loop continues for SETTLE_FRAMES after the last scroll for lerp convergence.
 * - Fires once on mount for initial positioning.
 */
export function useRafScroll(callback: (scrollY: number) => void): void {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    let rafId = 0
    let isRunning = false
    let latestScrollY = window.scrollY
    let framesSinceScroll = 0

    function tick(): void {
      callbackRef.current(latestScrollY)
      framesSinceScroll += 1

      if (framesSinceScroll < SETTLE_FRAMES) {
        rafId = requestAnimationFrame(tick)
      } else {
        isRunning = false
      }
    }

    function handleScroll(): void {
      latestScrollY = window.scrollY
      framesSinceScroll = 0

      if (!isRunning) {
        isRunning = true
        rafId = requestAnimationFrame(tick)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    // Fire once on mount for initial Moon positioning
    isRunning = true
    rafId = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])
}
