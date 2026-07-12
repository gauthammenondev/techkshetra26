import type React from 'react'
import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.ts'
import { useRafScroll } from '../hooks/useRafScroll.ts'
import { useTitleAnimation } from '../hooks/useTitleAnimation.ts'
import { PageTitle } from './PageTitle.tsx'
import {
  DEFAULT_MOON_CONFIG,
  computeGeometry,
  easeInOutCubic,
  lerp,
  clamp,
  globalMoonRef,
  type MoonConfig,
  type MoonGeometry,
  type RotationDirection,
} from './moon.types.ts'
import styles from './css/MoonPageLayout.module.css'

// Global state for continuous animation across page mounts.
let globalRenderedY: number | null = null
let globalRenderedOpacity: number | null = null
let globalRenderedAngle: number | null = null
let globalPreviousTitle: React.ReactNode = null

type MoonPageLayoutProps = {
  readonly title: React.ReactNode
  readonly content: React.ReactNode
  readonly footer: React.ReactNode
  readonly rotation?: number
  readonly config?: Partial<MoonConfig>
}

/**
 * Behavior: Orchestrates the Moon 3-state scroll system and rotation.
 * - Renders three scroll sections (z-index 1).
 * - Computes scroll progress → eased sub-progress → Moon translateY and opacity each frame.
 * - Lerps Moon rotation smoothly to the target rotation prop on route change.
 * - Animates the outgoing and incoming title using physics-based inertia.
 */
export function MoonPageLayout({
  title,
  content,
  footer,
  rotation = 0,
  config,
}: MoonPageLayoutProps): React.JSX.Element {
  const mergedConfig: MoonConfig = { ...DEFAULT_MOON_CONFIG, ...config }

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const geometryRef = useRef<MoonGeometry | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Determine title fly direction based on rotation delta on mount
  const [direction] = useState<RotationDirection>(() => {
    const initialAngleDelta = rotation - (globalRenderedAngle ?? rotation)
    if (initialAngleDelta > 0.01) return 'clockwise'
    if (initialAngleDelta < -0.01) return 'counter-clockwise'
    return 'none'
  })

  // Title animation state
  const [outgoingTitle, setOutgoingTitle] = useState<React.ReactNode>(globalPreviousTitle)

  useEffect(() => {
    return () => {
      globalPreviousTitle = title
    }
  }, [title])

  const handleOutgoingSettled = useCallback(() => {
    setOutgoingTitle(null)
  }, [])

  const { incomingRef, outgoingRef } = useTitleAnimation(
    outgoingTitle !== null,
    direction,
    handleOutgoingSettled
  )

  useLayoutEffect(() => {
  }, [])

  // Extract config values for effect dependency tracking
  const { zoomScale, lerpDamping, rotationDamping, rotationSettleThreshold, titleHeightVh, contentHeightVh, footerHeightVh } = mergedConfig

  // Behavior: Compute and cache Moon geometry on mount and viewport changes.
  useEffect(() => {
    function updateGeometry(): void {
      const vw = window.innerWidth
      const vh = window.innerHeight
      const totalHeight = document.documentElement.scrollHeight
      const effectConfig: MoonConfig = {
        zoomScale,
        titleHeightVh,
        contentHeightVh,
        footerHeightVh,
        lerpDamping,
        rotationDamping,
        rotationSettleThreshold,
      }
      const geo = computeGeometry(effectConfig, vw, vh, totalHeight)
      geometryRef.current = geo

      const moon = globalMoonRef.current
      if (moon) {
        moon.style.width = `${geo.moonSizePx}px`
        moon.style.height = `${geo.moonSizePx}px`
      }
    }

    updateGeometry()

    const resizeObserver = new ResizeObserver(updateGeometry)
    const wrapper = wrapperRef.current
    if (wrapper) {
      resizeObserver.observe(wrapper)
    }
    window.addEventListener('resize', updateGeometry)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateGeometry)
    }
  }, [zoomScale, lerpDamping, rotationDamping, rotationSettleThreshold, titleHeightVh, contentHeightVh, footerHeightVh])

  // Behavior: Map scroll position → eased progress → Moon transform/rotation each animation frame.
  useRafScroll((scrollY: number) => {
    const geo = geometryRef.current
    const moon = globalMoonRef.current
    if (!geo || !moon) return

    const rawP1 = clamp(scrollY / Math.max(geo.phase1End, 1), 0, 1)
    const phase2Range = geo.maxScroll - geo.phase2Start
    const rawP2 = phase2Range > 0
      ? clamp((scrollY - geo.phase2Start) / phase2Range, 0, 1)
      : 0

    const easedP1 = easeInOutCubic(rawP1)
    const easedP2 = easeInOutCubic(rawP2)

    const phase1Y = lerp(geo.targetA.translateY, geo.targetB.translateY, easedP1)
    const targetY = lerp(phase1Y, geo.targetC.translateY, easedP2)

    const phase1Opacity = lerp(geo.targetA.opacity, geo.targetB.opacity, easedP1)
    const targetOpacity = lerp(phase1Opacity, geo.targetC.opacity, easedP2)

    let finalY: number
    let finalOpacity: number
    let finalAngle: number
    
    if (reducedMotion.current || globalRenderedY === null || globalRenderedOpacity === null || globalRenderedAngle === null) {
      finalY = targetY
      finalOpacity = targetOpacity
      finalAngle = rotation
    } else {
      finalY =
        globalRenderedY +
        (targetY - globalRenderedY) * lerpDamping
      if (Math.abs(finalY - targetY) < 0.5) {
        finalY = targetY
      }

      finalOpacity =
        globalRenderedOpacity +
        (targetOpacity - globalRenderedOpacity) * lerpDamping
      if (Math.abs(finalOpacity - targetOpacity) < 0.001) {
        finalOpacity = targetOpacity
      }

      finalAngle =
        globalRenderedAngle +
        (rotation - globalRenderedAngle) * rotationDamping
      if (Math.abs(rotation - finalAngle) < rotationSettleThreshold) {
        finalAngle = rotation
      }
    }

    globalRenderedY = finalY
    globalRenderedOpacity = finalOpacity
    globalRenderedAngle = finalAngle
    
    moon.style.transform = `translate3d(-50%, ${finalY}px, 0) scale(1) rotate(${finalAngle}deg)`
    moon.style.opacity = finalOpacity.toString()
  })

  return (
    <div ref={wrapperRef} className={styles.scrollContainer}>
      <section
        className={styles.titleSection}
        style={{ height: `${mergedConfig.titleHeightVh}vh` }}
      >
        {outgoingTitle && (
          <PageTitle ref={outgoingRef} isOutgoing>
            {outgoingTitle}
          </PageTitle>
        )}
        <PageTitle ref={incomingRef}>
          {title}
        </PageTitle>
      </section>
      <main
        className={styles.contentSection}
        style={{ minHeight: `${mergedConfig.contentHeightVh}vh` }}
      >
        {content}
      </main>
      <footer
        className={styles.footerSection}
        style={{ height: `${mergedConfig.footerHeightVh}vh` }}
      >
        {footer}
      </footer>
    </div>
  )
}
