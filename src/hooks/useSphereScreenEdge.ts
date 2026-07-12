/**
 * Behavior: Projects the Sun sphere's top rim from 3D world-space
 * to 2D screen-space coordinates. Returns arc data that the
 * CurvedTitle SVG overlay uses to position text along the
 * sphere's visible edge.
 *
 * Recalculates when camera or canvas dimensions change.
 */

import { useState, useEffect } from 'react'
import type { Camera } from 'three'
import { Vector3 } from 'three'
import type { SphereArcData } from '../types/sun.types.ts'

const SPHERE_RADIUS = 8
const SPHERE_CENTER_Y = -4
const SAMPLE_COUNT = 8 // Points around the rim to project

/**
 * Projects a 3D world point to 2D screen pixel coordinates.
 */
function projectToScreen(
  point: Vector3,
  camera: Camera,
  width: number,
  height: number,
): { x: number; y: number } {
  const projected = point.clone().project(camera)
  return {
    x: (projected.x * 0.5 + 0.5) * width,
    y: (-projected.y * 0.5 + 0.5) * height,
  }
}

export function useSphereScreenEdge(
  camera: Camera | null,
  canvasWidth: number,
  canvasHeight: number,
): SphereArcData | null {
  const [arcData, setArcData] = useState<SphereArcData | null>(null)

  useEffect(() => {
    if (!camera || canvasWidth === 0 || canvasHeight === 0) return

    // Sample points around the top crown of the sphere
    const topY = SPHERE_CENTER_Y + SPHERE_RADIUS
    const crownRadius = SPHERE_RADIUS * 0.6 // Horizontal radius at crown sampling height

    const screenPoints: Array<{ x: number; y: number }> = []

    for (let i = 0; i < SAMPLE_COUNT; i++) {
      const angle = (i / SAMPLE_COUNT) * Math.PI * 2
      const worldPoint = new Vector3(
        Math.cos(angle) * crownRadius,
        topY - 0.5, // Slightly below the absolute top
        Math.sin(angle) * crownRadius,
      )
      screenPoints.push(projectToScreen(worldPoint, camera, canvasWidth, canvasHeight))
    }

    // Fit a circle to the projected screen points
    // Use the centroid as center and average distance as radius
    let cx = 0
    let cy = 0
    for (const p of screenPoints) {
      cx += p.x
      cy += p.y
    }
    cx /= screenPoints.length
    cy /= screenPoints.length

    let avgRadius = 0
    for (const p of screenPoints) {
      const dx = p.x - cx
      const dy = p.y - cy
      avgRadius += Math.sqrt(dx * dx + dy * dy)
    }
    avgRadius /= screenPoints.length

    setArcData({
      cx,
      cy,
      radius: avgRadius,
      startAngle: Math.PI * 1.15, // ~208° — left edge of visible arc
      endAngle: Math.PI * 1.85,   // ~333° — right edge of visible arc
    })
  }, [camera, canvasWidth, canvasHeight])

  return arcData
}
