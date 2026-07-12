/**
 * Behavior: Root application layout.
 * - Navigation fixed at top (z-index 10)
 * - Moon background renders per-page via MoonPageLayout (z-index 0)
 * - Route-based pages render via React Router
 * - Each page uses MoonPageLayout for scroll-driven Moon positioning
 */

import type React from 'react'
import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from './components/Navigation/Navigation.tsx'
import { MoonBackground } from './components/Moon/MoonBackground.tsx'
import { HomePage } from './components/Content/pages/HomePage.tsx'
import { EventsPage } from './components/Content/pages/EventsPage.tsx'
import { GalleryPage } from './components/Content/pages/GalleryPage.tsx'
import { AboutPage } from './components/Content/pages/AboutPage.tsx'
import { ContactPage } from './components/Content/pages/ContactPage.tsx'
import styles from './App.module.css'

/**
 * Behavior: Scrolls to top smoothly on route change.
 * Runs before the new page content renders to allow Moon to rotate and page to scroll as a unified transition.
 */
function ScrollToTop(): React.JSX.Element | null {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  return null
}

function App(): React.JSX.Element {
  return (
    <div className={styles.root}>
      <MoonBackground />
      <Navigation />
      <ScrollToTop />
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