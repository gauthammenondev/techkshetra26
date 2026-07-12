import type React from 'react'
import styles from '../Page.module.css'

export function EventsPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <p className={styles.subheading}>Technical competitions and workshops</p>
    </main>
  )
}

export default EventsPage