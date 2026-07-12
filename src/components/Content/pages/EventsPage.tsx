import type React from 'react'
import { MoonPageLayout } from '../../Moon/MoonPageLayout.tsx'
import styles from '../Page.module.css'

/**
 * Behavior: Events page with Moon scroll narrative.
 * - Title state: events heading centered in viewport.
 * - Content state: event category overview.
 * - Footer state: copyright attribution.
 */
export function EventsPage(): React.JSX.Element {
  return (
    <MoonPageLayout
      rotation={20}
      title={
        <>
          <h1 className={styles.heading}>Events</h1>
          <p className={styles.subheading}>Technical competitions and workshops</p>
        </>
      }
      content={
        <div className={styles.contentBody}>
          <p>
            Explore a wide range of events spanning coding, robotics, design,
            and more. Each event is crafted to challenge your skills and spark
            new ideas.
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

export default EventsPage