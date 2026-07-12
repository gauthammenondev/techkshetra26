/**
 * Behavior: Detects GPU performance tier on mount using detect-gpu.
 * Returns a simplified tier level ('high' | 'medium' | 'low')
 * that components use to scale rendering complexity:
 * - high: full noise octaves, all flares, full bloom
 * - medium: reduced noise, fewer flares
 * - low: minimal noise, 1-2 flares, simplified bloom
 */

import { useState, useEffect } from 'react'
import { getGPUTier } from 'detect-gpu'
import type { GPUTierLevel } from '../types/sun.types.ts'

export function useGPUTier(): GPUTierLevel {
  const [tier, setTier] = useState<GPUTierLevel>('high')

  useEffect(() => {
    let cancelled = false

    async function detect(): Promise<void> {
      const result = await getGPUTier()

      if (cancelled) return

      if (result.tier >= 3) {
        setTier('high')
      } else if (result.tier >= 2) {
        setTier('medium')
      } else {
        setTier('low')
      }
    }

    void detect()

    return () => {
      cancelled = true
    }
  }, [])

  return tier
}
