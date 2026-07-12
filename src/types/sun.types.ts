/**
 * Shared type definitions for the Sun navigation system.
 * Single source of truth for all page states, rotations, and nav items.
 */

export type PageState = 'home' | 'events' | 'gallery' | 'about' | 'contact'

export const PAGE_ROTATION_MAP: Readonly<Record<PageState, number>> = {
  home: 0,
  events: Math.PI * 0.4,
  gallery: Math.PI * 0.8,
  about: Math.PI * 1.2,
  contact: Math.PI * 1.6,
} as const

export const PAGE_TITLE_MAP: Readonly<Record<PageState, string>> = {
  home: "TECHKSHETRA'26",
  events: 'EVENTS',
  gallery: 'GALLERY',
  about: 'ABOUT',
  contact: 'CONTACT US',
} as const

/** Maps each page state to its URL path */
export const PAGE_PATH_MAP: Readonly<Record<PageState, string>> = {
  home: '/',
  events: '/events',
  gallery: '/gallery',
  about: '/about',
  contact: '/contact',
} as const

export type GPUTierLevel = 'high' | 'medium' | 'low'

export type SunShaderUniforms = {
  readonly uTime: { value: number }
  readonly uNoiseOctaves: { value: number }
}

export type NavItem = {
  readonly id: PageState
  readonly label: string
  readonly path: string
}

export const NAV_ITEMS_LEFT: readonly NavItem[] = [
  { id: 'events', label: 'Events', path: '/events' },
  { id: 'gallery', label: 'Gallery', path: '/gallery' },
] as const

export const NAV_ITEMS_RIGHT: readonly NavItem[] = [
  { id: 'about', label: 'About', path: '/about' },
  { id: 'contact', label: 'Contact Us', path: '/contact' },
] as const