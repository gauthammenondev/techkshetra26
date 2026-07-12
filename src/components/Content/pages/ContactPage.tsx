import type React from 'react'
import { MoonPageLayout } from '../../Moon/MoonPageLayout.tsx'
import styles from '../Page.module.css'

/**
 * Behavior: Contact page with Moon scroll narrative.
 * - Title state: contact heading centered in viewport.
 * - Content state: contact information.
 * - Footer state: copyright attribution.
 */
export function ContactPage(): React.JSX.Element {
  return (
    <MoonPageLayout
      title={
        <>
          <h1 className={styles.heading}>Contact Us</h1>
          <p className={styles.subheading}>Get in touch with the team</p>
        </>
      }
      content={
        <div className={styles.contentBody}>
          <p>
            Have questions about Techkshetra&apos;26? Want to participate,
            sponsor, or collaborate? Reach out to us and we will get back to
            you as soon as possible.
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

export default ContactPage