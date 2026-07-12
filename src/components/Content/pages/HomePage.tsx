import type React from 'react'
import styles from '../Page.module.css'

export function HomePage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Techkshetra&apos;26</h1>
      <p className={styles.subheading}>Where Technology Meets Innovation</p>
    </main>
  )
}

export default HomePage