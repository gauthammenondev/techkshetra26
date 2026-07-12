import type React from 'react'
import styles from './Header.module.css'

type NavItem = {
  readonly id: string
  readonly label: string
  readonly href: string
}

const LEFT_NAV_ITEMS: readonly NavItem[] = [
  { id: 'events', label: 'Events', href: '#' },
  { id: 'gallery', label: 'Gallery', href: '#' },
]

const RIGHT_NAV_ITEMS: readonly NavItem[] = [
  { id: 'about', label: 'About', href: '#' },
  { id: 'contact', label: 'Contact Us', href: '#' },
]

function NavList({ items }: { readonly items: readonly NavItem[] }): React.JSX.Element {
  return (
    <ul className={styles.navList}>
      {items.map((item) => (
        <li key={item.id} className={styles.navItem}>
          <a
            className={styles.navLink}
            href={item.href}
            aria-disabled="true"
            onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
            }}
          >
            {item.label}
          </a>
        </li>
      ))}
    </ul>
  )
}

export function Header(): React.JSX.Element {
  return (
    <header className={styles.header}>
      <nav className={styles.navLeft} aria-label="Primary navigation — left">
        <NavList items={LEFT_NAV_ITEMS} />
      </nav>

      <div className={styles.logoWrapper}>
        <span
          className={styles.logoPlaceholder}
          role="img"
          aria-label="Techkshetra'26 logo"
        >
          TK'26
        </span>
      </div>

      <nav className={styles.navRight} aria-label="Primary navigation — right">
        <NavList items={RIGHT_NAV_ITEMS} />
      </nav>
    </header>
  )
}

export default Header
