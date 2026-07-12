import type React from 'react'
import { useState } from 'react'
import moonImageSrc from '../../assets/Moon.png'
import styles from './MoonBackground.module.css'

type MoonBackgroundProps = {
  readonly ref: React.Ref<HTMLDivElement>
}

/**
 * Behavior: Renders the Moon image in a fixed viewport-filling layer.
 * - Image starts invisible (opacity 0) and fades in on load.
 * - Parent controls positioning via the forwarded ref (direct DOM writes).
 * - Pointer events pass through to content below.
 * - Background color matches the page to prevent blank flash during load.
 */
export function MoonBackground({ ref }: MoonBackgroundProps): React.JSX.Element {
  const [loaded, setLoaded] = useState(false)

  function handleLoad(): void {
    setLoaded(true)
  }

  return (
    <div className={styles.layer} aria-hidden="true">
      <div ref={ref} className={styles.moonWrapper}>
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
