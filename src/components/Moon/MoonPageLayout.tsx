import type React from 'react'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { MoonBackground } from './MoonBackground.tsx'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.ts'
import { useRafScroll } from '../../hooks/useRafScroll.ts'
import {
  DEFAULT_MOON_CONFIG,
  computeGeometry,
  easeInOutCubic,
  lerp,
  clamp,
  type MoonConfig,
  type MoonGeometry,
} from './moon.types.ts'
import styles from './MoonPageLayout.module.css'

type MoonPageLayoutProps = {
  readonly title: React.ReactNode
  readonly content: React.ReactNode
  readonly footer: React.ReactNode
  readonly config?: Partial<MoonConfig>
}

/**
 * Behavior: Orchestrates the Moon 3-state scroll system.
 * - Renders MoonBackground (fixed layer, z-index 0) and three scroll sections (z-index 1).
 * - Computes scroll progress → eased sub-progress → Moon translateY and opacity each frame.
 * - Recalculates geometry on viewport resize via ResizeObserver.
 * - All transform and opacity writes use direct DOM ref updates inside rAF — no React state.
 * - Respects prefers-reduced-motion: skips lerp damping, uses direct scroll mapping.
 */
export function MoonPageLayout({
  title,
  content,
  footer,
  config,
}: MoonPageLayoutProps): React.JSX.Element {
  const mergedConfig: MoonConfig = { ...DEFAULT_MOON_CONFIG, ...config }

  const moonRef = useRef<HTMLDivElement | null>(null)
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const geometryRef = useRef<MoonGeometry | null>(null)
  const renderedYRef = useRef<number | null>(null)
  const renderedOpacityRef = useRef<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()

  // Behavior: Reset scroll to top on mount (route change) before paint.
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Extract config values for effect dependency tracking
  const { zoomScale, lerpDamping, titleHeightVh, contentHeightVh, footerHeightVh } = mergedConfig

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
      }
      const geo = computeGeometry(effectConfig, vw, vh, totalHeight)
      geometryRef.current = geo

      // Size the Moon wrapper via direct DOM write (only recalculated on resize)
      const moon = moonRef.current
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
  }, [zoomScale, lerpDamping, titleHeightVh, contentHeightVh, footerHeightVh])

  // Behavior: Map scroll position → eased progress → Moon transform each animation frame.
  useRafScroll((scrollY: number) => {
    const geo = geometryRef.current
    const moon = moonRef.current
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
    
    if (reducedMotion.current || renderedYRef.current === null || renderedOpacityRef.current === null) {
      finalY = targetY
      finalOpacity = targetOpacity
    } else {
      finalY =
        renderedYRef.current +
        (targetY - renderedYRef.current) * lerpDamping
      // Snap when close enough to prevent sub-pixel drift
      if (Math.abs(finalY - targetY) < 0.5) {
        finalY = targetY
      }

      finalOpacity =
        renderedOpacityRef.current +
        (targetOpacity - renderedOpacityRef.current) * lerpDamping
      // Snap when close enough to prevent precision drift
      if (Math.abs(finalOpacity - targetOpacity) < 0.001) {
        finalOpacity = targetOpacity
      }
    }

    renderedYRef.current = finalY
    renderedOpacityRef.current = finalOpacity
    
    moon.style.transform = `translate3d(-50%, ${finalY}px, 0)`
    moon.style.opacity = finalOpacity.toString()
  })

  return (
    <>
      <MoonBackground ref={moonRef} />
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
    </>
  )
}
