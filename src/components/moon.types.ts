/**
 * Moon scroll system — types, configuration, and pure utility functions.
 * Single source of truth for all Moon geometry, easing, and state logic.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Semantic label for the Moon's current scroll state. */
export type MoonState = 'title' | 'content' | 'footer'

export type MoonKeyframe = {
  readonly translateY: number
  readonly scale: number
  readonly opacity: number
}

/** Configuration for the Moon scroll system. All values are readonly. */
export type MoonConfig = {
  /** Scale factor: Moon rendered width = zoomScale × viewport width. */
  readonly zoomScale: number
  /** Lerp damping factor for hybrid smoothing (0 < d < 1). Ignored with reduced motion. */
  readonly lerpDamping: number
  /** Lerp damping factor for Moon rotation (0 < d < 1). */
  readonly rotationDamping: number
  /** Threshold below which Moon rotation lerp snaps to target (degrees). */
  readonly rotationSettleThreshold: number
  /** Title section height in vh units. */
  readonly titleHeightVh: number
  /** Content section minimum height in vh units. */
  readonly contentHeightVh: number
  /** Footer section height in vh units. */
  readonly footerHeightVh: number
}

export type TitleAnimConfig = {
  readonly flyDamping: number        // lerp factor for x position
  readonly bendSensitivity: number   // skew multiplier from velocity
  readonly bendDecayFactor: number   // lerp factor for bend return
  readonly opacityDamping: number    // lerp factor for opacity
  readonly settleThreshold: number   // px delta to consider settled
}

export type RotationDirection = 'clockwise' | 'counter-clockwise' | 'none'

/** Computed geometry for Moon positioning, recalculated on resize. */
export type MoonGeometry = {
  /** keyframe state when Moon's top-horizon tip aligns with 50vh. */
  readonly targetA: MoonKeyframe
  /** keyframe state when Moon center aligns with viewport center. */
  readonly targetB: MoonKeyframe
  /** keyframe state when Moon's bottom-horizon tip aligns with 50vh. */
  readonly targetC: MoonKeyframe
  /** Maximum scrollable distance (document height − viewport height). */
  readonly maxScroll: number
  /** Viewport height in pixels. */
  readonly viewportHeight: number
  /** Moon rendered size in pixels (square). */
  readonly moonSizePx: number
  /** ScrollY at which the title→content transition completes. */
  readonly phase1End: number
  /** ScrollY at which the content→footer transition begins. */
  readonly phase2Start: number
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const DEFAULT_MOON_CONFIG: MoonConfig = {
  zoomScale: 3.0,
  lerpDamping: 0.1,
  rotationDamping: 0.08,
  rotationSettleThreshold: 0.01,
  titleHeightVh: 100,
  contentHeightVh: 300,
  footerHeightVh: 100,
} as const

export const TITLE_ANIM_CONFIG: TitleAnimConfig = {
  flyDamping: 0.08,
  bendSensitivity: 0.20,
  bendDecayFactor: 0.12,
  opacityDamping: 0.1,
  settleThreshold: 0.5,
} as const

import React from 'react'
export const globalMoonRef = React.createRef<HTMLDivElement>()

/* ------------------------------------------------------------------ */
/*  Pure utility functions                                             */
/* ------------------------------------------------------------------ */

/** Easing: cubic ease-in-out — accelerates then decelerates. */
export function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - (-2 * t + 2) ** 3 / 2
}

/** Linearly interpolate between two values. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** Clamp a value to the [min, max] range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Derive the semantic Moon state from raw scroll sub-progresses. */
export function getMoonState(rawP1: number, rawP2: number): MoonState {
  if (rawP1 < 1) return 'title'
  if (rawP2 <= 0) return 'content'
  return 'footer'
}

/* ------------------------------------------------------------------ */
/*  Geometry computation                                               */
/* ------------------------------------------------------------------ */

/**
 * Behavior: Computes Moon geometry from config and current viewport measurements.
 *
 * The Moon image is rendered as a square of `moonSizePx` (= zoomScale × viewportWidth).
 * Three keyframe targets position the Moon so that:
 *   A — top-horizon tip touches viewport midline (50vh), opacity 0.9
 *   B — Moon center aligns with viewport center, opacity 0.3
 *   C — bottom-horizon tip touches viewport midline (50vh), opacity 0.9
 *
 * Scroll is divided into two transition phases:
 *   Phase 1: scrollY 0 → phase1End          (title → content, A → B)
 *   Phase 2: scrollY phase2Start → maxScroll (content → footer, B → C)
 *   Between phases the Moon holds at position B.
 */
export function computeGeometry(
  config: MoonConfig,
  viewportWidth: number,
  viewportHeight: number,
  totalScrollHeight: number,
): MoonGeometry {
  const moonSizePx = config.zoomScale * viewportWidth

  // Target A: Moon's top edge (top-horizon tip) at 50vh, full opacity
  const targetA: MoonKeyframe = {
    translateY: viewportHeight / 2,
    scale: 1.0,
    opacity: 0.9,
  }

  // Target B: Moon's center at viewport center, reduced opacity
  const targetB: MoonKeyframe = {
    translateY: (viewportHeight - moonSizePx) / 2,
    scale: 1.0,
    opacity: 0.3,
  }

  // Target C: Moon's bottom edge (bottom-horizon tip) at 50vh, full opacity
  const targetC: MoonKeyframe = {
    translateY: viewportHeight / 2 - moonSizePx,
    scale: 1.0,
    opacity: 0.9,
  }

  const maxScroll = Math.max(totalScrollHeight - viewportHeight, 1)
  const titleHeightPx = (config.titleHeightVh / 100) * viewportHeight
  const footerHeightPx = (config.footerHeightVh / 100) * viewportHeight

  const phase1End = titleHeightPx
  const phase2Start = Math.max(maxScroll - footerHeightPx, phase1End)

  return {
    targetA,
    targetB,
    targetC,
    maxScroll,
    viewportHeight,
    moonSizePx,
    phase1End,
    phase2Start,
  }
}
