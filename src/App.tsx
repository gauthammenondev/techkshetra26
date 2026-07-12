/**
 * Behavior: Root application layout.
 * - Navigation fixed at top (z-index 10)
 * - Sun WebGL canvas fills the viewport (z-index 0)
 * - Route-based pages render via React Router
 * - No content panel overlay — pages are separate routes
 */

import type React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Navigation } from './components/Navigation/Navigation.tsx'
import { Sun } from './components/Sun/Sun.tsx'
import { HomePage } from './components/Content/pages/HomePage.tsx'
import { EventsPage } from './components/Content/pages/EventsPage.tsx'
import { GalleryPage } from './components/Content/pages/GalleryPage.tsx'
import { AboutPage } from './components/Content/pages/AboutPage.tsx'
import { ContactPage } from './components/Content/pages/ContactPage.tsx'
import styles from './App.module.css'

function App(): React.JSX.Element {
  return (
    <div className={styles.root}>
      <Navigation />
      <Sun />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </div>
  )
}

export default App