/**
 * Behavior: 3D scene composition.
 *
 * Camera strategy — "zoomed crown" framing:
 *   The sphere has radius 8, centered at Y = -2.
 *   Its top sits at world Y = +6.
 *   Camera sits at Y = 4, Z = 6, looking at Y = 0.
 *   This frames the top ~40% of the sphere — a wide glowing crown
 *   that dominates the lower half of the viewport.
 *
 * Post-processing: bloom picks up HDR surface values.
 */

import type React from 'react'
import { PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { SunSphere } from './SunSphere.tsx'
import { SunFlares } from './SunFlares.tsx'
import type { GPUTierLevel } from '../../types/sun.types.ts'

function getBloomIntensity(tier: GPUTierLevel): number {
  switch (tier) {
    case 'high': return 2.0
    case 'medium': return 1.4
    case 'low': return 0.8
  }
}

type SunSceneProps = {
  readonly gpuTier: GPUTierLevel
  readonly reducedMotion: boolean
}

export function SunScene({ gpuTier, reducedMotion }: SunSceneProps): React.JSX.Element {
  const bloomIntensity = getBloomIntensity(gpuTier)

  return (
    <>
      {/*
        Camera positioned to frame only the Sun's crown.
        Y=4 keeps us above the equator.
        Z=6 is close enough to fill the viewport width with the sphere.
        Looking toward origin (0,0,0) puts the crown center-frame.
      */}
      <PerspectiveCamera
        makeDefault
        position={[0, 4, 6]}
        fov={55}
        near={0.1}
        far={200}
      />

      <SunSphere gpuTier={gpuTier} reducedMotion={reducedMotion} />
      <SunFlares gpuTier={gpuTier} reducedMotion={reducedMotion} />

      <EffectComposer>
        <Bloom
          luminanceThreshold={0.6}
          luminanceSmoothing={0.4}
          intensity={bloomIntensity}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export default SunScene