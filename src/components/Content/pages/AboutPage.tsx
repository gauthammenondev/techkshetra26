import type React from 'react'
import styles from '../Page.module.css'

export function AboutPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <p className={styles.subheading}>Our story and mission</p>
    </main>
  )
}

export default AboutPage