import type React from 'react'
import { MoonPageLayout } from './MoonPageLayout.tsx'
import { Footer } from './Footer.tsx'
import styles from './css/Page.module.css'

/**
 * Behavior: Gallery page with Moon scroll narrative.
 * - Title state: gallery heading centered in viewport.
 * - Content state: gallery description.
 * - Footer state: footer component.
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

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Aftermovie / Reels</h2>
            <div className={styles.placeholderGrid}>
              <div className={styles.placeholderCard} style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Video Player Placeholder</p>
              </div>
            </div>
          </div>

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Photo Gallery</h2>
            <div className={styles.placeholderGrid}>
              <div className={styles.placeholderCard} style={{ height: '150px' }}>
                <p>Image Placeholder 1</p>
              </div>
              <div className={styles.placeholderCard} style={{ height: '150px' }}>
                <p>Image Placeholder 2</p>
              </div>
              <div className={styles.placeholderCard} style={{ height: '150px' }}>
                <p>Image Placeholder 3</p>
              </div>
              <div className={styles.placeholderCard} style={{ height: '150px' }}>
                <p>Image Placeholder 4</p>
              </div>
            </div>
          </div>
        </div>
      }
      footer={<Footer />}
    />
  )
}

export default GalleryPage