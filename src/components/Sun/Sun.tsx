import type React from 'react'
import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { SunScene } from './SunScene.tsx'
import { useGPUTier } from '../../hooks/useGPUTier.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import { useSunStore } from '../../store/sunStore.ts'
import { PAGE_ROTATION_DEGREES } from '../../types/sun.types.ts'
import type { PageState } from '../../types/sun.types.ts'
import styles from './Sun.module.css'

const MAX_PIXEL_RATIO = 2

function getPageStateFromPath(path: string): PageState {
  if (path === '/events') return 'events'
  if (path === '/gallery') return 'gallery'
  if (path === '/about') return 'about'
  if (path === '/contact') return 'contact'
  return 'home'
}

export function Sun(): React.JSX.Element {
  const gpuTier = useGPUTier()
  const reducedMotion = useReducedMotion()
  const location = useLocation()

  const activePage = useSunStore((state) => state.activePage)
  const initializePage = useSunStore((state) => state.initializePage)

  // Synchronize store with route changes when loaded directly or via history nav (back/forward)
  useEffect(() => {
    const page = getPageStateFromPath(location.pathname)
    if (page !== activePage) {
      initializePage(page, PAGE_ROTATION_DEGREES[page])
    }
  }, [location.pathname, activePage, initializePage])

  return (
    <div className={styles.sunContainer}>
      <Canvas
        dpr={Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO)}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <SunScene gpuTier={gpuTier} reducedMotion={reducedMotion} />
      </Canvas>
    </div>
  )
}

export default Sun