import type React from 'react'
import { useRef, useMemo } from 'react'
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
const SPHERE_CENTER_Y = 0           // Must match SunSphere local center
const SPHERE_TOP_Y = SPHERE_CENTER_Y + SPHERE_RADIUS  // = 8

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

function createFlareCurve(config: FlareConfig): QuadraticBezierCurve3 {
  const surfaceR = SPHERE_RADIUS * 0.25
  const startAngle = config.angle - 0.12
  const endAngle = config.angle + 0.12

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

  const control = new Vector3(
    Math.cos(config.angle) * surfaceR * 0.5,
    SPHERE_TOP_Y + config.height,
    Math.sin(config.angle) * surfaceR * 0.5,
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

  // Generate flare configurations once on mount
  const configs = useMemo(() => generateFlareConfigs(flareCount), [flareCount])

  // Pre-generate tube geometries once to avoid garbage collection and GPU upload overhead
  const geometries = useMemo(() => {
    return configs.map((config) => {
      const curve = createFlareCurve(config)
      return new TubeGeometry(curve, 16, 0.05, 6, false)
    })
  }, [configs])

  useFrame((_state, delta) => {
    if (reducedMotion) return
    timeRef.current += delta

    const group = groupRef.current
    if (!group) return

    group.children.forEach((child, index) => {
      const config = configs[index]
      if (!config) return

      const mesh = child as Mesh

      // Horizontal drift/sway along the crown
      mesh.rotation.y = Math.sin(timeRef.current * config.speed + config.phase * Math.PI * 2) * 0.12

      // Vertical pulse height scaling (simulates flare eruption)
      const scaleY = 1.0 + Math.sin(timeRef.current * config.speed * 1.5 + config.phase) * 0.08
      mesh.scale.set(1.0, scaleY, 1.0)
    })
  })

  return (
    <group ref={groupRef}>
      {geometries.map((geometry, i) => (
        <mesh key={i} geometry={geometry}>
          <meshBasicMaterial
            color={[2.5, 0.7, 0.15]}
            toneMapped={false}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  )
}

export default SunFlares