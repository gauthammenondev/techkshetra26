import type React from 'react'
import { MoonPageLayout } from './MoonPageLayout.tsx'
import { Footer } from './Footer.tsx'
import styles from './css/Page.module.css'

/**
 * Behavior: About page with Moon scroll narrative.
 * - Title state: about heading centered in viewport.
 * - Content state: mission and story.
 * - Footer state: footer component.
 */
export function AboutPage(): React.JSX.Element {
  return (
    <MoonPageLayout
      rotation={60}
      title={
        <>
          <h1 className={styles.heading}>About</h1>
          <p className={styles.subheading}>Our story and mission</p>
        </>
      }
      content={
        <div className={styles.contentBody}>
          <p>
            Techkshetra was born from a vision to create a platform where
            technology enthusiasts could connect, compete, and collaborate.
            Year after year, it has grown into one of the most anticipated
            tech fests in the region.
          </p>

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Fest Statistics</h2>
            <div className={styles.placeholderGrid}>
              <div className={styles.placeholderCard}>
                <h3>Expected Footfall</h3>
                <p>6000+ Attendees</p>
              </div>
              <div className={styles.placeholderCard}>
                <h3>Total Reach</h3>
                <p>15.4K+ Accounts</p>
              </div>
              <div className={styles.placeholderCard}>
                <h3>Interactions</h3>
                <p>28K+ Engagements</p>
              </div>
            </div>
          </div>

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>About RSET</h2>
            <p>
              Rajagiri School of Engineering & Technology (RSET) is a premier 
              educational institution offering excellence in engineering education 
              and research.
            </p>
          </div>
        </div>
      }
      footer={<Footer />}
    />
  )
}

export default AboutPage