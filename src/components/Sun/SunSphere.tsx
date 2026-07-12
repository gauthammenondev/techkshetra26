/**
 * Behavior: Procedurally-shaded Sun sphere with spring rotation.
 *
 * THE KEY FIX:
 *   meshRef.current.rotation.y is mutated directly inside useFrame.
 *   Previously, rotation-y={currentRotation.current} was set once
 *   at render time — ref mutations never trigger re-renders, so the
 *   sphere never moved. Direct mutation on the Three.js object works
 *   because R3F syncs the scene graph every frame automatically.
 *
 * Sphere positioning:
 *   Center at Y = -2. Radius = 8. Top crown at Y = +6.
 *   Camera at Y = 4, Z = 6 frames the crown filling the lower viewport.
 */

import type React from 'react'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { ShaderMaterial } from 'three'
import vertexShader from '../../shaders/sunSurface.vert.glsl'
import fragmentShader from '../../shaders/sunSurface.frag.glsl'
import type { GPUTierLevel } from '../../types/sun.types.ts'

const SPHERE_RADIUS = 8
const SPHERE_SEGMENTS = 64
const SPHERE_CENTER_Y = 0

/** [radius, widthSegments, heightSegments] */
const SPHERE_ARGS: [number, number, number] = [
  SPHERE_RADIUS,
  SPHERE_SEGMENTS,
  SPHERE_SEGMENTS,
]

function getNoiseOctaves(tier: GPUTierLevel): number {
  switch (tier) {
    case 'high': return 3
    case 'medium': return 2
    case 'low': return 1
  }
}

type SunSphereProps = {
  readonly gpuTier: GPUTierLevel
  readonly reducedMotion: boolean
}

export function SunSphere({ gpuTier, reducedMotion }: SunSphereProps): React.JSX.Element {
  const meshRef = useRef<Mesh>(null)
  const materialRef = useRef<ShaderMaterial>(null)

  const noiseOctaves = getNoiseOctaves(gpuTier)

  const uniforms = useRef({
    uTime: { value: 0 },
    uNoiseOctaves: { value: noiseOctaves },
  })

  useFrame((_state, delta) => {
    const mesh = meshRef.current
    const material = materialRef.current
    if (!mesh) return

    // — Surface animation —
    if (material && !reducedMotion) {
      uniforms.current.uTime.value += delta * 0.4
      uniforms.current.uNoiseOctaves.value = noiseOctaves
    }

    // — Slow continuous globe Y-rotation —
    if (!reducedMotion) {
      mesh.rotation.y += delta * 0.05
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[0, SPHERE_CENTER_Y, 0]}
    >
      <sphereGeometry args={SPHERE_ARGS} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
        toneMapped={false}
      />
    </mesh>
  )
}

export default SunSphere