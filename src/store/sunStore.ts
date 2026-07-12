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
}

type SunStoreActions = {
  readonly setPage: (page: PageState) => void
  readonly completeRotation: () => void
  readonly completeTransition: () => void
}

type SunStore = SunStoreState & SunStoreActions

export const useSunStore = create<SunStore>((set, get) => ({
  activePage: 'home',
  targetRotation: PAGE_ROTATION_MAP.home,
  isTransitioning: false,
  rotationComplete: false,

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
}))