/**
 * Behavior: Root WebGL canvas container.
 * - Fills entire viewport (fixed, inset 0)
 * - Alpha canvas blends with page background
 * - Pixel ratio capped at 2
 * - GPU tier and reduced motion detected here and passed down
 */

import type React from 'react'
import { Canvas } from '@react-three/fiber'
import { SunScene } from './SunScene.tsx'
import { useGPUTier } from '../../hooks/useGPUTier.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import styles from './Sun.module.css'

const MAX_PIXEL_RATIO = 2

export function Sun(): React.JSX.Element {
  const gpuTier = useGPUTier()
  const reducedMotion = useReducedMotion()

  return (
    <div className={styles.sunContainer}>
      <Canvas
        dpr={Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <SunScene gpuTier={gpuTier} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}

export default Sun