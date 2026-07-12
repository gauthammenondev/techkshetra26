/**
 * Behavior: Site navigation using React Router Links.
 * - NavLink from react-router-dom handles active state via URL
 * - Clicking a nav item also calls sunStore.setPage() to trigger rotation
 * - Split layout: left nav | logo | right nav
 * - Keyboard accessible, focus-visible rings
 */

import type React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useSunStore } from '../../store/sunStore.ts'
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT, PAGE_ROTATION_DEGREES } from '../../types/sun.types.ts'
import type { NavItem, PageState } from '../../types/sun.types.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import styles from './Navigation.module.css'

function NavList({
  items,
  onNavigate,
}: {
  readonly items: readonly NavItem[]
  readonly onNavigate: (page: PageState, path: string, event: React.MouseEvent) => void
}): React.JSX.Element {
  return (
    <ul className={styles.navList}>
      {items.map((item) => (
        <li key={item.id} className={styles.navItem}>
          <NavLink
            to={item.path}
            className={({ isActive }) =>
              isActive
                ? `${styles.navLink} ${styles.navLinkActive}`
                : styles.navLink
            }
            onClick={(e) => { onNavigate(item.id, item.path, e) }}
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function Navigation(): React.JSX.Element {
  const cssRotationAngle = useSunStore((state) => state.cssRotationAngle)
  const isAnimating = useSunStore((state) => state.isAnimating)
  const activePage = useSunStore((state) => state.activePage)
  const startTransition = useSunStore((state) => state.startTransition)
  const endTransition = useSunStore((state) => state.endTransition)
  const reducedMotion = useReducedMotion()
  const navigate = useNavigate()

  function handleNavigate(page: PageState, path: string, event: React.MouseEvent): void {
    event.preventDefault()
    if (page === activePage || isAnimating) return

    if (reducedMotion) {
      startTransition(page, PAGE_ROTATION_DEGREES[page])
      navigate(path)
      endTransition()
      return
    }

    const targetBase = PAGE_ROTATION_DEGREES[page]
    const currentAngle = cssRotationAngle
    const diff = ((targetBase - currentAngle) % 360 + 360) % 360
    const delta = diff > 180 ? diff - 360 : diff
    const nextAngle = currentAngle + delta

    startTransition(page, nextAngle)

    setTimeout(() => {
      navigate(path)
      useSunStore.getState().endTransition()
    }, 600)
  }

  function handleHomeClick(e: React.MouseEvent): void {
    handleNavigate('home', '/', e)
  }

  return (
    <header className={styles.header}>
      <nav className={styles.navLeft} aria-label="Primary navigation left">
        <NavList items={NAV_ITEMS_LEFT} onNavigate={handleNavigate} />
      </nav>

      <div className={styles.logoWrapper}>
        <button
          className={styles.logoButton}
          type="button"
          onClick={handleHomeClick}
          aria-label="Techkshetra 26 — go to home"
        >
          TK&apos;26
        </button>
      </div>

      <nav className={styles.navRight} aria-label="Primary navigation right">
        <NavList items={NAV_ITEMS_RIGHT} onNavigate={handleNavigate} />
      </nav>
    </header>
  )
}

export default Navigation