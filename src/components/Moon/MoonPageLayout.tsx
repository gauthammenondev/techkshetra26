import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts'
import { useRafScroll } from '../../hooks/useRafScroll.ts'
import {
  DEFAULT_MOON_CONFIG,
  computeGeometry,
  easeInOutCubic,
  lerp,
  clamp,
  globalMoonRef,
  type MoonConfig,
  type MoonGeometry,
} from './moon.types.ts'
import styles from './MoonPageLayout.module.css'

// Global state for continuous animation across page mounts.
// By persisting these values, the Moon inherits its exact position, opacity, 
// and rotation from the previous page, allowing for completely seamless 
// transitions during route changes without unmounting or snapping.
let globalRenderedY: number | null = null
let globalRenderedOpacity: number | null = null
let globalRenderedAngle: number | null = null

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
 * - Recalculates geometry on viewport resize via ResizeObserver.
 * - All transform and opacity writes use direct DOM ref updates inside rAF on the globally persisted MoonBackground layer.
 * - Respects prefers-reduced-motion: skips lerp damping, uses direct mapping.
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

  // Behavior: Smooth scrolling to top is handled globally by App.tsx <ScrollToTop />,
  // but we keep this layout effect as a fallback for structural positioning.
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

      // Size the Moon wrapper via direct DOM write (only recalculated on resize)
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

    // Compute raw sub-progresses for each transition phase
    const rawP1 = clamp(scrollY / Math.max(geo.phase1End, 1), 0, 1)
    const phase2Range = geo.maxScroll - geo.phase2Start
    const rawP2 = phase2Range > 0
      ? clamp((scrollY - geo.phase2Start) / phase2Range, 0, 1)
      : 0

    // Apply easing to each sub-progress independently
    const easedP1 = easeInOutCubic(rawP1)
    const easedP2 = easeInOutCubic(rawP2)

    // Interpolate Moon Y through keyframes: A → B → C
    const phase1Y = lerp(geo.targetA.translateY, geo.targetB.translateY, easedP1)
    const targetY = lerp(phase1Y, geo.targetC.translateY, easedP2)

    // Interpolate Moon opacity through keyframes: A → B → C
    const phase1Opacity = lerp(geo.targetA.opacity, geo.targetB.opacity, easedP1)
    const targetOpacity = lerp(phase1Opacity, geo.targetC.opacity, easedP2)

    // Apply hybrid smoothing (lerp damping) or direct mapping
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
      // Snap when close enough to prevent sub-pixel drift
      if (Math.abs(finalY - targetY) < 0.5) {
        finalY = targetY
      }

      finalOpacity =
        globalRenderedOpacity +
        (targetOpacity - globalRenderedOpacity) * lerpDamping
      // Snap when close enough to prevent precision drift
      if (Math.abs(finalOpacity - targetOpacity) < 0.001) {
        finalOpacity = targetOpacity
      }

      finalAngle =
        globalRenderedAngle +
        (rotation - globalRenderedAngle) * rotationDamping
      // Snap when close enough to prevent infinite micro-updates
      if (Math.abs(rotation - finalAngle) < rotationSettleThreshold) {
        finalAngle = rotation
      }
    }

    globalRenderedY = finalY
    globalRenderedOpacity = finalOpacity
    globalRenderedAngle = finalAngle
    
    // Single unified DOM write per frame
    moon.style.transform = `translate3d(-50%, ${finalY}px, 0) scale(1) rotate(${finalAngle}deg)`
    moon.style.opacity = finalOpacity.toString()
  })

  return (
    <div ref={wrapperRef} className={styles.scrollContainer}>
      <section
        className={styles.titleSection}
        style={{ height: `${mergedConfig.titleHeightVh}vh` }}
      >
        {title}
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
