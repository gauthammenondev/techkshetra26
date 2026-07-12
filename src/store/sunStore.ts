/**
 * Behavior: Global state for the Sun rotation system.
 * - Zustand vanilla store readable inside Three.js useFrame
 *   without triggering React render cycles
 * - setPage() initiates rotation to a new angle
 * - completeRotation() signals the sphere has settled
 */

import { create } from 'zustand'
import { PAGE_ROTATION_MAP } from '../types/sun.types.ts'
import type { PageState } from '../types/sun.types.ts'

type SunStoreState = {
  readonly activePage: PageState
  readonly targetRotation: number
  readonly isTransitioning: boolean
  readonly rotationComplete: boolean
  readonly cssRotationAngle: number
  readonly isAnimating: boolean
  readonly startAngle: number
  readonly targetAngle: number
  readonly startTime: number
}

type SunStoreActions = {
  readonly setPage: (page: PageState) => void
  readonly completeRotation: () => void
  readonly completeTransition: () => void
  readonly initializePage: (page: PageState, angle: number) => void
  readonly startTransition: (page: PageState, angle: number) => void
  readonly endTransition: () => void
}

type SunStore = SunStoreState & SunStoreActions

export const useSunStore = create<SunStore>((set, get) => ({
  activePage: 'home',
  targetRotation: PAGE_ROTATION_MAP.home,
  isTransitioning: false,
  rotationComplete: false,
  cssRotationAngle: -90, // Maps to home page rotation
  isAnimating: false,
  startAngle: -90,
  targetAngle: -90,
  startTime: 0,

  setPage: (page: PageState) => {
    const current = get()
    if (current.activePage === page) return

    set({
      activePage: page,
      targetRotation: PAGE_ROTATION_MAP[page],
      isTransitioning: true,
      rotationComplete: false,
    })
  },

  completeRotation: () => {
    set({ rotationComplete: true })
  },

  completeTransition: () => {
    set({ isTransitioning: false, rotationComplete: false })
  },

  initializePage: (page: PageState, angle: number) => {
    set({
      activePage: page,
      startAngle: angle,
      targetAngle: angle,
      cssRotationAngle: angle,
      isAnimating: false,
      startTime: 0,
    })
  },

  startTransition: (page: PageState, angle: number) => {
    const currentAngle = get().targetAngle
    set({
      activePage: page,
      startAngle: currentAngle,
      targetAngle: angle,
      cssRotationAngle: angle,
      isTransitioning: true,
      isAnimating: true,
      startTime: performance.now(),
    })
  },

  endTransition: () => {
    const current = get()
    set({
      isAnimating: false,
      isTransitioning: false,
      startAngle: current.targetAngle,
    })
  },
}))