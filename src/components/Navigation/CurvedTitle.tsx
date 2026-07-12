/**
 * Behavior: Renders the active page title along a curved SVG arc
 * that follows the Sun sphere's top edge.
 * - SVG path arc is computed to match the sphere's projected rim
 * - Text follows the arc via <textPath> with centered alignment
 * - Crossfades between old and new title during page transitions
 * - Recalculates arc on window resize
 */

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSunStore } from '../../store/sunStore.ts'
import { PAGE_TITLE_MAP } from '../../types/sun.types.ts'
import styles from './CurvedTitle.module.css'

/** Builds an SVG arc path descriptor for a circle segment */
function buildArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const startRad = (startAngleDeg * Math.PI) / 180
  const endRad = (endAngleDeg * Math.PI) / 180

  const startX = cx + radius * Math.cos(startRad)
  const startY = cy + radius * Math.sin(startRad)
  const endX = cx + radius * Math.cos(endRad)
  const endY = cy + radius * Math.sin(endRad)

  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
}

export function CurvedTitle(): React.JSX.Element {
  const activePage = useSunStore((state) => state.activePage)
  const isTransitioning = useSunStore((state) => state.isTransitioning)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Track container dimensions via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(container)
    return () => { observer.disconnect() }
  }, [])

  // Compute arc path based on container dimensions
  const cx = dimensions.width / 2
  const cy = dimensions.height + 20 // Center below visible area to show crown arc
  const radius = Math.max(dimensions.width * 0.6, 200)
  const arcPath = buildArcPath(cx, cy, radius, 220, 320)

  const title = PAGE_TITLE_MAP[activePage]

  return (
    <div ref={containerRef} className={styles.curvedTitleContainer}>
      <svg
        className={styles.curvedTitleSvg}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width || 1} ${dimensions.height || 1}`}
        aria-hidden="true"
      >
        <defs>
          <path id="sun-arc" d={arcPath} />
        </defs>

        {/* Active title */}
        <text
          className={`${styles.titleText} ${isTransitioning ? styles.titleFadeOut : styles.titleFadeIn}`}
        >
          <textPath
            href="#sun-arc"
            startOffset="50%"
            textAnchor="middle"
          >
            {title}
          </textPath>
        </text>
      </svg>
    </div>
  )
}

export default CurvedTitle
