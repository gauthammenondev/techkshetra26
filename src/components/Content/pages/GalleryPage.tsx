import type React from 'react'
import styles from '../Page.module.css'

export function GalleryPage(): React.JSX.Element {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Gallery</h1>
      <p className={styles.subheading}>Moments from Techkshetra</p>
    </main>
  )
}

export default GalleryPage