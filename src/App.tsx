import type React from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navigation } from './components/Navigation/Navigation.tsx'
import { Sun } from './components/Sun/Sun.tsx'
import { CurvedTitle } from './components/Navigation/CurvedTitle.tsx'
import { useSunStore } from './store/sunStore.ts'
import { useReducedMotion } from './hooks/useReducedMotion.ts'
import { PAGE_PATH_MAP, PAGE_ROTATION_DEGREES } from './types/sun.types.ts'
import type { PageState } from './types/sun.types.ts'
import styles from './App.module.css'

const PAGE_ORDER: readonly PageState[] = ['events', 'gallery', 'home', 'about', 'contact'] as const
const TRANSITION_DURATION = 600 // 600ms transition duration matching text slide timing

function App(): React.JSX.Element {
  const navigate = useNavigate()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    let touchStartY = 0

    function handleScrollTransition(direction: 'next' | 'prev'): void {
      const store = useSunStore.getState()
      if (store.isAnimating) return

      const currentIndex = PAGE_ORDER.indexOf(store.activePage)
      let nextIndex = currentIndex

      if (direction === 'next') {
        nextIndex = Math.min(currentIndex + 1, PAGE_ORDER.length - 1)
      } else {
        nextIndex = Math.max(currentIndex - 1, 0)
      }

      if (nextIndex === currentIndex) return

      const nextPage = PAGE_ORDER[nextIndex]
      const nextPath = PAGE_PATH_MAP[nextPage]

      if (reducedMotion) {
        store.startTransition(nextPage, PAGE_ROTATION_DEGREES[nextPage])
        navigate(nextPath)
        store.endTransition()
        return
      }

      const targetBase = PAGE_ROTATION_DEGREES[nextPage]
      const currentAngle = store.cssRotationAngle
      const diff = ((targetBase - currentAngle) % 360 + 360) % 360
      const delta = diff > 180 ? diff - 360 : diff
      const nextAngle = currentAngle + delta

      store.startTransition(nextPage, nextAngle)

      setTimeout(() => {
        navigate(nextPath)
        useSunStore.getState().endTransition()
      }, TRANSITION_DURATION)
    }

    function onWheel(e: WheelEvent): void {
      if (Math.abs(e.deltaY) < 40) return
      handleScrollTransition(e.deltaY > 0 ? 'next' : 'prev')
    }

    function onTouchStart(e: TouchEvent): void {
      const firstTouch = e.touches[0]
      if (firstTouch) {
        touchStartY = firstTouch.clientY
      }
    }

    function onTouchEnd(e: TouchEvent): void {
      const lastTouch = e.changedTouches[0]
      if (lastTouch) {
        const touchEndY = lastTouch.clientY
        const diffY = touchStartY - touchEndY

        if (Math.abs(diffY) > 60) {
          handleScrollTransition(diffY > 0 ? 'next' : 'prev')
        }
      }
    }

    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [navigate, reducedMotion])

  return (
    <div className={styles.root}>
      <Navigation />
      <Sun />
      <CurvedTitle />
    </div>
  )
}

export default App