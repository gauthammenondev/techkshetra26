import type React from 'react'
import { MoonPageLayout } from './MoonPageLayout.tsx'
import { Footer } from './Footer.tsx'
import styles from './css/Page.module.css'

/**
 * Behavior: Contact page with Moon scroll narrative.
 * - Title state: contact heading centered in viewport.
 * - Content state: contact information.
 * - Footer state: footer component.
 */
export function ContactPage(): React.JSX.Element {
  return (
    <MoonPageLayout
      rotation={80}
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
      footer={<Footer />}
    />
  )
}

export default ContactPage