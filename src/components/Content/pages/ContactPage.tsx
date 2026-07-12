import type React from 'react'
import styles from '../Page.module.css'

export function ContactPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Contact Us</h1>
      <p className={styles.subheading}>Get in touch with the team</p>
    </main>
  )
}

export default ContactPage