import { useEffect, useRef } from 'react'
import { TITLE_ANIM_CONFIG, type RotationDirection } from '../components/Moon/moon.types.ts'
import { usePrefersReducedMotion } from './usePrefersReducedMotion.ts'

export function useTitleAnimation(
  hasOutgoing: boolean,
  direction: RotationDirection,
  onOutgoingSettled: () => void
) {
  const incomingRef = useRef<HTMLDivElement | null>(null)
  const outgoingRef = useRef<HTMLDivElement | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  const stateRef = useRef({
    inX: 0,
    inVel: 0,
    inBend: 0,
    inOpacity: 0,
    outX: 0,
    outVel: 0,
    outBend: 0,
    outOpacity: 1,
    initialized: false,
    settled: false,
  })

  useEffect(() => {
    let rafId: number
    const state = stateRef.current
    
    // Reset state on new navigation
    state.initialized = false
    state.settled = false
    
    function tick() {
      const vw = window.innerWidth
      const OFFSCREEN_LEFT = -vw * 1.2
      const OFFSCREEN_RIGHT = vw * 1.2
      
      const { flyDamping, bendSensitivity, bendDecayFactor, opacityDamping, settleThreshold } = TITLE_ANIM_CONFIG
      
      if (!state.initialized) {
        state.initialized = true
        
        if (reducedMotion.current) {
          state.inX = 0
          state.outX = 0
          state.inOpacity = 0
          state.outOpacity = 1
        } else {
          // Initialize positions based on direction.
          // Unified movement: if moving LEFT, incoming starts RIGHT, outgoing ends LEFT.
          if (direction === 'clockwise') {
            // Text moves LEFT
            state.inX = OFFSCREEN_RIGHT
            state.outX = 0
          } else if (direction === 'counter-clockwise') {
            // Text moves RIGHT
            state.inX = OFFSCREEN_LEFT
            state.outX = 0
          } else {
            // No rotation, just crossfade
            state.inX = 0
            state.outX = 0
          }
          state.inOpacity = 0
          state.outOpacity = 1
          state.inVel = 0
          state.outVel = 0
          state.inBend = 0
          state.outBend = 0
        }
      }

      const inEl = incomingRef.current
      const outEl = outgoingRef.current

      let allSettled = true

      // Update incoming
      if (inEl) {
        if (reducedMotion.current) {
          state.inOpacity += (1 - state.inOpacity) * opacityDamping
          inEl.style.transform = `translate(-50%, -50%) translate3d(0px, 0, 0) skewX(0deg)`
          inEl.style.opacity = `${state.inOpacity}`
          if (Math.abs(1 - state.inOpacity) > 0.01) allSettled = false
        } else {
          const targetInX = 0
          const prevX = state.inX
          state.inX += (targetInX - state.inX) * flyDamping
          state.inVel = state.inX - prevX
          
          const targetBend = -state.inVel * bendSensitivity
          state.inBend += (targetBend - state.inBend) * bendDecayFactor
          
          state.inOpacity += (1 - state.inOpacity) * opacityDamping
          
          inEl.style.transform = `translate(-50%, -50%) translate3d(${state.inX}px, 0, 0) skewX(${state.inBend}deg)`
          inEl.style.opacity = `${state.inOpacity}`
          
          if (Math.abs(targetInX - state.inX) > settleThreshold || Math.abs(state.inBend) > 0.1 || Math.abs(1 - state.inOpacity) > 0.01) {
            allSettled = false
          }
        }
      } else {
        allSettled = false
      }

      // Update outgoing
      if (hasOutgoing) {
        if (outEl) {
          if (reducedMotion.current) {
            state.outOpacity += (0 - state.outOpacity) * opacityDamping
            outEl.style.transform = `translate(-50%, -50%) translate3d(0px, 0, 0) skewX(0deg)`
            outEl.style.opacity = `${state.outOpacity}`
            if (Math.abs(0 - state.outOpacity) > 0.01) allSettled = false
          } else {
            // Target out X follows unified direction
            const targetOutX = direction === 'clockwise' ? OFFSCREEN_LEFT : direction === 'counter-clockwise' ? OFFSCREEN_RIGHT : 0
            
            const prevX = state.outX
            state.outX += (targetOutX - state.outX) * flyDamping
            state.outVel = state.outX - prevX
            
            const targetBend = -state.outVel * bendSensitivity
            state.outBend += (targetBend - state.outBend) * bendDecayFactor
            
            state.outOpacity += (0 - state.outOpacity) * opacityDamping
            
            outEl.style.transform = `translate(-50%, -50%) translate3d(${state.outX}px, 0, 0) skewX(${state.outBend}deg)`
            outEl.style.opacity = `${state.outOpacity}`
            
            if (Math.abs(targetOutX - state.outX) > settleThreshold || Math.abs(state.outBend) > 0.1 || Math.abs(0 - state.outOpacity) > 0.01) {
              allSettled = false
            }
          }
        } else {
          allSettled = false
        }
      }

      if (allSettled && !state.settled) {
        state.settled = true
        if (hasOutgoing) {
          onOutgoingSettled()
        }
      } else if (!state.settled) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [hasOutgoing, direction, reducedMotion, onOutgoingSettled])

  return { incomingRef, outgoingRef }
}
