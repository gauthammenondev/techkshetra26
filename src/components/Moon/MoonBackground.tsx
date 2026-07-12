import React, { useState } from 'react'
import moonImageSrc from '../../assets/Moon.png'
import { globalMoonRef } from './moon.types.ts'
import styles from './MoonBackground.module.css'

/**
 * Behavior: Renders the Moon image in a fixed viewport-filling layer.
 * - Image starts invisible (opacity 0) and fades in on load.
 * - Parent controls positioning and layer opacity via the global ref (direct DOM writes).
 * - Pointer events pass through to content below.
 * - Background color matches the page to prevent blank flash during load.
 * - By mounting once at the App level, the Moon never unmounts across page changes.
 */
export function MoonBackground(): React.JSX.Element {
  const [loaded, setLoaded] = useState(false)

  function handleLoad(): void {
    setLoaded(true)
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      <div ref={globalMoonRef} className={styles.moonWrapper} style={{ willChange: 'transform, opacity' }}>
        <img
          src={moonImageSrc}
          alt=""
          className={
            loaded
              ? `${styles.moonImage} ${styles.moonImageLoaded}`
              : styles.moonImage
          }
          draggable={false}
          decoding="async"
          onLoad={handleLoad}
        />
      </div>
    </div>
  )
}
