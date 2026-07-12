import type React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT } from '../types/sun.types.ts'
import type { NavItem } from '../types/sun.types.ts'
import styles from './css/Navigation.module.css'

function NavList({
  items,
}: {
  readonly items: readonly NavItem[]
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
          >
            {item.label}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}

export function Navigation(): React.JSX.Element {
  const navigate = useNavigate()

  function handleHomeClick(): void {
    void navigate('/')
  }

  return (
    <header className={styles.header}>
      <nav className={styles.navLeft} aria-label="Primary navigation left">
        <NavList items={NAV_ITEMS_LEFT} />
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
        <NavList items={NAV_ITEMS_RIGHT} />
      </nav>
    </header>
  )
}

export default Navigation