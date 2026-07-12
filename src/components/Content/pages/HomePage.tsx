import type React from 'react'
import { MoonPageLayout } from '../../Moon/MoonPageLayout.tsx'
import styles from '../Page.module.css'

/**
 * Behavior: Home page with Moon scroll narrative.
 * - Title state: event name and tagline centered in viewport.
 * - Content state: introduction to Techkshetra'26.
 * - Footer state: copyright attribution.
 */
export function HomePage(): React.JSX.Element {
  return (
    <MoonPageLayout
      rotation={0}
      title={
        <>
          <h1 className={styles.heading}>Techkshetra&apos;26</h1>
          <p className={styles.subheading}>Where Technology Meets Innovation</p>
        </>
      }
      content={
        <div className={styles.contentBody}>
          <p>
            Techkshetra is the annual national-level technical festival of
            Rajagiri School of Engineering &amp; Technology. Bringing together
            minds from across the country, it celebrates innovation, creativity,
            and the spirit of engineering.
          </p>
          <p>
            From competitive coding challenges to robotics workshops, from
            hackathons to tech talks by industry leaders — Techkshetra offers
            something for every curious mind.
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

export default HomePage