/**
 * Behavior: Orchestrates content panel fade transitions.
 * Follows the exact transition sequence:
 * 1. Nav click → store.isTransitioning becomes true
 * 2. Current content fades OUT (opacity 0, 200ms)
 * 3. Sun rotation begins (driven by store.targetRotation)
 * 4. Rotation completes → store.rotationComplete becomes true
 * 5. New content fades IN (opacity 1, 300ms)
 * 6. Fade-in complete → store.completeTransition() called
 *
 * Reduced motion: instant swap, no fade delays.
 */

import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSunStore } from '../../store/sunStore.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import type { PageState } from '../../types/sun.types.ts'
import { HomePage } from './pages/HomePage.tsx'
import { EventsPage } from './pages/EventsPage.tsx'
import { GalleryPage } from './pages/GalleryPage.tsx'
import { AboutPage } from './pages/AboutPage.tsx'
import { ContactPage } from './pages/ContactPage.tsx'
import styles from './ContentPanel.module.css'

const FADE_OUT_DURATION = 200
const FADE_IN_DURATION = 300

/** Maps page state to its content component */
function renderPage(page: PageState): React.JSX.Element {
  switch (page) {
    case 'home': return <HomePage />
    case 'events': return <EventsPage />
    case 'gallery': return <GalleryPage />
    case 'about': return <AboutPage />
    case 'contact': return <ContactPage />
  }
}

export function ContentPanel(): React.JSX.Element {
  const activePage = useSunStore((state) => state.activePage)
  const isTransitioning = useSunStore((state) => state.isTransitioning)
  const rotationComplete = useSunStore((state) => state.rotationComplete)
  const completeTransition = useSunStore((state) => state.completeTransition)
  const reducedMotion = useReducedMotion()

  const [displayedPage, setDisplayedPage] = useState<PageState>(activePage)
  const [fadeState, setFadeState] = useState<'visible' | 'fading-out' | 'fading-in'>('visible')
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Step 2: When transition starts, fade out current content
  useEffect(() => {
    if (isTransitioning && fadeState === 'visible') {
      if (reducedMotion) {
        // Instant swap
        setDisplayedPage(activePage)
        return
      }

      setFadeState('fading-out')

      fadeTimerRef.current = setTimeout(() => {
        // Step 3: Fade-out complete — content is hidden during rotation
        setFadeState('fading-out')
      }, FADE_OUT_DURATION)
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current)
      }
    }
  }, [isTransitioning, fadeState, reducedMotion, activePage])

  // Step 5: When rotation completes, swap content and fade in
  useEffect(() => {
    if (rotationComplete && fadeState === 'fading-out') {
      setDisplayedPage(activePage)
      setFadeState('fading-in')

      fadeTimerRef.current = setTimeout(() => {
        setFadeState('visible')
        completeTransition()
      }, FADE_IN_DURATION)
    }

    if (reducedMotion && rotationComplete) {
      setDisplayedPage(activePage)
      setFadeState('visible')
      completeTransition()
    }

    return () => {
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current)
      }
    }
  }, [rotationComplete, fadeState, activePage, completeTransition, reducedMotion])

  let containerClass = styles.contentPanel
  if (fadeState === 'fading-out') {
    containerClass = `${styles.contentPanel} ${styles.fadeOut}`
  } else if (fadeState === 'fading-in') {
    containerClass = `${styles.contentPanel} ${styles.fadeIn}`
  }

  return (
    <main className={containerClass} aria-live="polite">
      {renderPage(displayedPage)}
    </main>
  )
}

export default ContentPanel
