/**
 * Behavior: Animated solar flare arcs rising from the Sun's crown.
 * - Bezier tube meshes rebuilt each frame at the new sphere position
 * - Emissive color values > 1.0 so bloom picks them up
 * - Count scales with GPU tier
 */

import type React from 'react'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  QuadraticBezierCurve3,
  Vector3,
  TubeGeometry,
  Group,
  Mesh,
} from 'three'
import type { GPUTierLevel } from '../../types/sun.types.ts'

const SPHERE_RADIUS = 8
const SPHERE_CENTER_Y = -4           // Must match SunSphere
const SPHERE_TOP_Y = SPHERE_CENTER_Y + SPHERE_RADIUS  // = +4

function getFlareCount(tier: GPUTierLevel): number {
  switch (tier) {
    case 'high': return 5
    case 'medium': return 3
    case 'low': return 2
  }
}

type FlareConfig = {
  readonly angle: number
  readonly height: number
  readonly phase: number
  readonly speed: number
}

function generateFlareConfigs(count: number): readonly FlareConfig[] {
  return Array.from({ length: count }, (_, i) => ({
    angle: (i / count) * Math.PI * 2,
    height: 0.6 + (i % 3) * 0.5,
    phase: (i * 1.618) % 1,
    speed: 0.25 + (i % 2) * 0.15,
  }))
}

function createFlareCurve(config: FlareConfig, time: number): QuadraticBezierCurve3 {
  const animatedAngle = config.angle
    + Math.sin(time * config.speed + config.phase * Math.PI * 2) * 0.25

  // Flares emerge from the crown surface
  const surfaceR = SPHERE_RADIUS * 0.25

  const startAngle = animatedAngle - 0.12
  const endAngle = animatedAngle + 0.12

  const start = new Vector3(
    Math.cos(startAngle) * surfaceR,
    SPHERE_TOP_Y - 0.3,
    Math.sin(startAngle) * surfaceR,
  )

  const end = new Vector3(
    Math.cos(endAngle) * surfaceR,
    SPHERE_TOP_Y - 0.3,
    Math.sin(endAngle) * surfaceR,
  )

  const heightOscillation = config.height
    + Math.sin(time * config.speed * 1.5 + config.phase) * 0.25

  const control = new Vector3(
    Math.cos(animatedAngle) * surfaceR * 0.5,
    SPHERE_TOP_Y + heightOscillation,
    Math.sin(animatedAngle) * surfaceR * 0.5,
  )

  return new QuadraticBezierCurve3(start, control, end)
}

type SunFlaresProps = {
  readonly gpuTier: GPUTierLevel
  readonly reducedMotion: boolean
}

export function SunFlares({ gpuTier, reducedMotion }: SunFlaresProps): React.JSX.Element {
  const groupRef = useRef<Group>(null)
  const timeRef = useRef(0)
  const flareCount = getFlareCount(gpuTier)
  const configs = useRef(generateFlareConfigs(flareCount))

  useFrame((_state, delta) => {
    if (reducedMotion) return
    timeRef.current += delta

    const group = groupRef.current
    if (!group) return

    group.children.forEach((child, index) => {
      const config = configs.current[index]
      if (!config) return

      const mesh = child as Mesh
      const curve = createFlareCurve(config, timeRef.current)
      const newGeometry = new TubeGeometry(curve, 16, 0.05, 6, false)

      mesh.geometry.dispose()
      mesh.geometry = newGeometry
    })
  })

  return (
    <group ref={groupRef}>
      {Array.from({ length: flareCount }, (_, i) => {
        const config = configs.current[i]
        if (!config) return null

        const curve = createFlareCurve(config, 0)

        return (
          <mesh key={i}>
            <primitive
              object={new TubeGeometry(curve, 16, 0.05, 6, false)}
              attach="geometry"
            />
            <meshBasicMaterial
              color={[2.5, 0.7, 0.15]}
              toneMapped={false}
              transparent
              opacity={0.85}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default SunFlares