import type React from 'react'
import { MoonPageLayout } from '../../Moon/MoonPageLayout.tsx'
import styles from '../Page.module.css'

/**
 * Behavior: Gallery page with Moon scroll narrative.
 * - Title state: gallery heading centered in viewport.
 * - Content state: gallery description.
 * - Footer state: copyright attribution.
 */
export function GalleryPage(): React.JSX.Element {
  return (
    <MoonPageLayout
      rotation={40}
      title={
        <>
          <h1 className={styles.heading}>Gallery</h1>
          <p className={styles.subheading}>Moments from Techkshetra</p>
        </>
      }
      content={
        <div className={styles.contentBody}>
          <p>
            Relive the highlights from past editions of Techkshetra. From
            electrifying competitions to memorable gatherings, every moment
            tells a story.
          </p>
        </div>
      }
      footer={
        <div className={styles.footerBody}>
          <p>© 2026 Techkshetra · Rajagiri School of Engineering &amp; Technology</p>
        </div>
      }
    />
  )
}

export default GalleryPage