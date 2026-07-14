/**
 * ComingSoonPage — Standalone QR landing page.
 *
 * Behavior:
 * - Full-viewport immersive "coming soon" reveal for Techkshetra'26.
 * - Renders WITHOUT Navigation or MoonBackground (standalone for QR scans).
 * - Uses ornate serif font (Cinzel Decorative) for "Techkshetra".
 * - Torch/flashlight cursor: dark overlay with radial-gradient hole following mouse.
 * - CSS-only animations: staggered entrance, floating particles, glow pulse, scan line.
 */

import type React from 'react'
import { useEffect, useRef, useCallback } from 'react'
import styles from './ComingSoonPage.module.css'

export function ComingSoonPage(): React.JSX.Element {
  const wrapperRef = useRef<HTMLDivElement | null>(null)

  /**
   * Behavior: Track mouse position and write CSS custom properties directly to the
   * wrapper element. The torch overlay, glow, and cursor dot all read these properties
   * to position themselves. Uses requestAnimationFrame for smooth 60fps updates.
   */
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const x = e.clientX
    const y = e.clientY
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Percentage-based for the radial-gradient `at` position
    const pctX = ((x / vw) * 100).toFixed(2)
    const pctY = ((y / vh) * 100).toFixed(2)

    wrapper.style.setProperty('--mx', `${pctX}%`)
    wrapper.style.setProperty('--my', `${pctY}%`)
    // Pixel-based for the glow and cursor dot
    wrapper.style.setProperty('--mx-px', `${x}px`)
    wrapper.style.setProperty('--my-px', `${y}px`)
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [handleMouseMove])

  return (
    <div ref={wrapperRef} className={styles.pageWrapper}>
      {/* Torch flashlight overlay — dark with a radial "hole" at cursor */}
      <div className={styles.torchOverlay} aria-hidden="true" />

      {/* Warm ambient glow following cursor */}
      <div className={styles.torchGlow} aria-hidden="true" />

      {/* Glowing cursor dot */}
      <div className={styles.cursorDot} aria-hidden="true" />

      {/* Noise texture overlay for subtle grain */}
      <div className={styles.noiseOverlay} aria-hidden="true" />

      {/* Animated scan line sweep */}
      <div className={styles.scanLine} aria-hidden="true" />

      {/* Floating particles */}
      <div className={styles.particlesLayer} aria-hidden="true">
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
        <div className={styles.particle} />
      </div>

      {/* Repeating "COMING SOON" watermark — scrolling down */}
      <div className={styles.watermarkLayer} aria-hidden="true">
        <div className={styles.watermarkScroll}>
          {/* Set A — fills first 100vh */}
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          {/* Set B — duplicate for seamless loop */}
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
          <span className={styles.watermarkLine}>COMING SOON</span>
        </div>
      </div>

      {/* Radial glow behind content */}
      <div className={styles.glowOrb} aria-hidden="true" />

      {/* Corner accents */}
      <div className={`${styles.cornerAccent} ${styles.cornerTopLeft}`} aria-hidden="true" />
      <div className={`${styles.cornerAccent} ${styles.cornerTopRight}`} aria-hidden="true" />
      <div className={`${styles.cornerAccent} ${styles.cornerBottomLeft}`} aria-hidden="true" />
      <div className={`${styles.cornerAccent} ${styles.cornerBottomRight}`} aria-hidden="true" />

      {/* Hero content */}
      <div className={styles.heroContent}>
        <h1 className={styles.comingSoonText}>
          Coming<br />Soon
        </h1>
        <p className={styles.techkshetraText}>Techkshetra</p>
        <div className={styles.divider} />
        <p className={styles.tagline}>Where Technology Meets Innovation</p>
        <span className={styles.yearBadge}>2026</span>
      </div>

      {/* Bottom branding */}
      <div className={styles.brandingBar}>
        <p className={styles.collegeName}>
          Rajagiri School of Engineering &amp; Technology
        </p>
      </div>
    </div>
  )
}

export default ComingSoonPage

