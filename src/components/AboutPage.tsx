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
        </div>
      }
      footer={<Footer />}
    />
  )
}

export default AboutPage