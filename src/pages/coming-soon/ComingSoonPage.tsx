/**
 * ComingSoonPage — Standalone QR landing page.
 *
 * Behavior:
 * - Full-viewport immersive "coming soon" reveal for Techkshetra'26.
 * - Page starts dark. A pull cord hangs from the top-right area.
 * - Clicking the cord triggers a pull animation and switches ON a spotlight
 *   that illuminates the center content (Techkshetra FallingText).
 * - Clicking "Techkshetra" triggers the FallingText fall → reveals "Coming Soon".
 * - CSS-only animations: staggered entrance, floating particles, glow pulse, scan line.
 */

import type React from 'react'
import { useCallback, useState } from 'react'
import styles from './ComingSoonPage.module.css'
import FallingText from '../../components/FallingText/FallingText'

export function ComingSoonPage(): React.JSX.Element {
  const [lightOn, setLightOn] = useState(false)
  const [isPulling, setIsPulling] = useState(false)
  const [hasRevealed, setHasRevealed] = useState(false)

  const handleCordPull = useCallback(() => {
    if (isPulling) return
    setIsPulling(true)

    // Cord snaps back after pull animation, then spotlight toggles
    setTimeout(() => {
      setLightOn((prev) => !prev)
    }, 400)

    // Reset pulling state after animation completes (1.2s)
    setTimeout(() => {
      setIsPulling(false)
    }, 1200)
  }, [isPulling])

  const handleFall = useCallback(() => {
    setHasRevealed(true)
  }, [])

  return (
    <div className={`${styles.pageWrapper} ${lightOn ? styles.lightOn : ''}`}>
      {/* Darkness overlay — covers everything when light is OFF */}
      <div
        className={`${styles.darknessOverlay} ${lightOn ? styles.darknessOff : ''}`}
        aria-hidden="true"
      />

      {/* Spotlight cone — visible only when light is ON */}
      <div
        className={`${styles.spotlightCone} ${lightOn ? styles.spotlightOn : ''}`}
        aria-hidden="true"
      />

      {/* Spotlight glow on content area */}
      <div
        className={`${styles.spotlightGlow} ${lightOn ? styles.spotlightGlowOn : ''}`}
        aria-hidden="true"
      />

      {/* Pull cord assembly */}
      <div
        className={`${styles.cordAssembly} ${isPulling ? styles.cordPulledState : ''}`}
        onClick={handleCordPull}
        role="button"
        tabIndex={0}
        aria-label="Pull cord to toggle spotlight"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCordPull() }}
      >
        {/* Ceiling fixture / mount point */}
        <div className={styles.ceilingFixture} />
        {/* The cord line */}
        <div className={styles.cordLine} />
        {/* Pull handle at the bottom */}
        <div className={styles.cordHandle}>
          {!lightOn && !isPulling && <span className={styles.cordLabel}>click</span>}
        </div>
      </div>

      {/* Noise texture overlay removed for performance */}

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
        {/* Stacked reveal container */}
        <div className={styles.revealContainer}>
          {/* "Coming Soon" — revealed when FallingText is triggered */}
          <h1
            className={`${styles.comingSoonText} ${hasRevealed ? styles.comingSoonRevealed : styles.comingSoonHidden}`}
          >
            Coming<br />Soon
          </h1>

          {/* FallingText overlay */}
          <div 
            className={styles.fallingTextOverlay}
            style={{ pointerEvents: lightOn ? 'auto' : 'none' }}
          >
            <FallingText
              text="Techkshetra'26"
              highlightWords={["Techkshetra'26"]}
              highlightClass={styles.fallingTextHighlight}
              trigger="click"
              backgroundColor="transparent"
              wireframes={false}
              gravity={0.56}
              fontSize="clamp(2.5rem, 12vw, 7.5rem)"
              mouseConstraintStiffness={0.9}
              onTrigger={handleFall}
              externalTrigger={hasRevealed}
            />
          </div>
        </div>

        {/* Click hint — visible only after light is on but before text falls */}
        {lightOn && !hasRevealed && (
          <p 
            className={styles.clickHint} 
            onClick={handleFall}
            style={{ cursor: 'pointer', zIndex: 30, position: 'relative' }}
          >
            click to reveal
          </p>
        )}

        <div className={styles.divider} />
        <p className={styles.tagline}>Where Technology Meets Innovation</p>
        <span className={styles.yearBadge}>2026</span>
      </div>

      {/* Bottom branding */}
      <div className={styles.brandingBar}>
        <p className={styles.collegeName}>
          Rajagiri School of Engineering &amp; Technology
        </p>
        <div className={styles.websiteCredits}>
          <p>With Love and Tokens</p>
          <p>by the website team</p>
        </div>
      </div>
    </div>
  )
}

export default ComingSoonPage
