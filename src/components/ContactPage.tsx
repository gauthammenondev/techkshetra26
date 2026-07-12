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

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Contact Personnel</h2>
            <div className={styles.placeholderGrid}>
              <div className={styles.placeholderCard}>
                <h3>Convenor</h3>
                <p>+91 67670 69690</p>
                <p>lmfoa@techkshetra.in</p>
              </div>
              <div className={styles.placeholderCard}>
                <h3>Public Relations</h3>
                <p>+91 67676 69420</p>
                <p>lmao@techkshetra.in</p>
              </div>
            </div>
          </div>

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Get in Touch</h2>
            <div className={styles.placeholderCard}>
              <p>[Contact Form Placeholder]</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>Name, Email, Message, Submit Button</p>
            </div>
          </div>

          <div className={styles.placeholderSection}>
            <h2 className={styles.placeholderHeading}>Location</h2>
            <div className={styles.placeholderCard} style={{ height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p>[Google Maps Embed Placeholder]</p>
            </div>
          </div>
        </div>
      }
      footer={<Footer />}
    />
  )
}

export default ContactPage