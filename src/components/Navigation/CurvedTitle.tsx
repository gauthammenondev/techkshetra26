import type React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useSunStore } from '../../store/sunStore.ts'
import { useReducedMotion } from '../../hooks/useReducedMotion.ts'
import { PAGE_TITLE_MAP, PAGE_SUBTITLE_MAP } from '../../types/sun.types.ts'
import type { PageState } from '../../types/sun.types.ts'
import styles from './CurvedTitle.module.css'

const PAGE_ORDER: readonly PageState[] = ['events', 'gallery', 'home', 'about', 'contact'] as const
const TRANSITION_DURATION = 600 // 600ms matching request

/** Builds an SVG arc path descriptor for a circle segment */
function buildArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
): string {
  const startRad = (startAngleDeg * Math.PI) / 180
  const endRad = (endAngleDeg * Math.PI) / 180

  const startX = cx + radius * Math.cos(startRad)
  const startY = cy + radius * Math.sin(startRad)
  const endX = cx + radius * Math.cos(endRad)
  const endY = cy + radius * Math.sin(endRad)

  const largeArc = endAngleDeg - startAngleDeg > 180 ? 1 : 0

  return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}`
}

type TransitionState = {
  readonly outgoingPage: PageState | null
  readonly incomingPage: PageState
  readonly direction: 'forward' | 'backward'
  readonly progress: number // 0 to 1
  readonly isAnimating: boolean
}

export function CurvedTitle(): React.JSX.Element {
  const activePage = useSunStore((state) => state.activePage)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const reducedMotion = useReducedMotion()

  const [transition, setTransition] = useState<TransitionState>({
    outgoingPage: null,
    incomingPage: activePage,
    direction: 'forward',
    progress: 1,
    isAnimating: false,
  })

  const prevPageRef = useRef<PageState>(activePage)

  // Trigger curve slide animation when activePage changes
  useEffect(() => {
    const prevPage = prevPageRef.current
    if (activePage !== prevPage) {
      prevPageRef.current = activePage

      if (reducedMotion) {
        setTransition({
          outgoingPage: null,
          incomingPage: activePage,
          direction: 'forward',
          progress: 1,
          isAnimating: false,
        })
        return
      }

      const prevIndex = PAGE_ORDER.indexOf(prevPage)
      const nextIndex = PAGE_ORDER.indexOf(activePage)
      const direction = nextIndex > prevIndex ? 'forward' : 'backward'

      setTransition({
        outgoingPage: prevPage,
        incomingPage: activePage,
        direction,
        progress: 0,
        isAnimating: true,
      })

      const startTime = performance.now()
      let animFrameId: number

      function animStep(now: number): void {
        const elapsed = now - startTime
        const rawProgress = Math.min(elapsed / TRANSITION_DURATION, 1)

        // Sine ease-in-out curve for smooth sliding acceleration
        const easedProgress = (1 - Math.cos(rawProgress * Math.PI)) / 2

        setTransition((prev) => ({
          ...prev,
          progress: easedProgress,
        }))

        if (rawProgress < 1) {
          animFrameId = requestAnimationFrame(animStep)
        } else {
          setTransition({
            outgoingPage: null,
            incomingPage: activePage,
            direction,
            progress: 1,
            isAnimating: false,
          })
        }
      }

      animFrameId = requestAnimationFrame(animStep)
      return () => {
        cancelAnimationFrame(animFrameId)
      }
    }
  }, [activePage, reducedMotion])

  // Track container dimensions via ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })

    observer.observe(container)
    return () => { observer.disconnect() }
  }, [])

  // Heading path wrapping the sun crown
  const cx = dimensions.width / 2
  const cy = dimensions.height * 1.12
  const radiusHeading = Math.max(dimensions.height * 0.68, 300)
  const arcPathHeading = buildArcPath(cx, cy, radiusHeading, 220, 320)

  // Subtitle path concentric and 55px lower
  const radiusSubtitle = radiusHeading - 55
  const arcPathSubtitle = buildArcPath(cx, cy, radiusSubtitle, 220, 320)

  // Outgoing page content details
  const outgoingTitle = transition.outgoingPage ? PAGE_TITLE_MAP[transition.outgoingPage] : ''
  const outgoingSubtitle = transition.outgoingPage ? PAGE_SUBTITLE_MAP[transition.outgoingPage] : ''

  // Incoming page content details
  const incomingTitle = PAGE_TITLE_MAP[transition.incomingPage]
  const incomingSubtitle = PAGE_SUBTITLE_MAP[transition.incomingPage]

  // Calculate SVG offsets (resting position is 50%)
  let outgoingOffset = '50%'
  let incomingOffset = '50%'

  if (transition.isAnimating) {
    if (transition.direction === 'forward') {
      // Exiting to left (50% -> -20%), Entering from right (120% -> 50%)
      outgoingOffset = `${50 - transition.progress * 70}%`
      incomingOffset = `${120 - transition.progress * 70}%`
    } else {
      // Exiting to right (50% -> 120%), Entering from left (-20% -> 50%)
      outgoingOffset = `${50 + transition.progress * 70}%`
      incomingOffset = `${-20 + transition.progress * 70}%`
    }
  }

  return (
    <div ref={containerRef} className={styles.curvedTitleContainer}>
      <h1
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: '0',
        }}
      >
        {incomingTitle}
      </h1>
      <svg
        className={styles.curvedTitleSvg}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width || 1} ${dimensions.height || 1}`}
        aria-hidden="true"
      >
        <defs>
          <path id="sun-arc-heading" d={arcPathHeading} />
          <path id="sun-arc-subtitle" d={arcPathSubtitle} />
        </defs>

        {/* Render outgoing text while animating */}
        {transition.isAnimating && transition.outgoingPage && (
          <g style={{ opacity: 1 - transition.progress }}>
            <text className={styles.titleText}>
              <textPath
                href="#sun-arc-heading"
                startOffset={outgoingOffset}
                textAnchor="middle"
              >
                {outgoingTitle}
              </textPath>
            </text>
            <text className={styles.subtitleText}>
              <textPath
                href="#sun-arc-subtitle"
                startOffset={outgoingOffset}
                textAnchor="middle"
              >
                {outgoingSubtitle}
              </textPath>
            </text>
          </g>
        )}

        {/* Render incoming text */}
        <g style={{ opacity: transition.isAnimating ? transition.progress : 1 }}>
          <text className={styles.titleText}>
            <textPath
              href="#sun-arc-heading"
              startOffset={incomingOffset}
              textAnchor="middle"
            >
              {incomingTitle}
            </textPath>
          </text>
          <text className={styles.subtitleText}>
            <textPath
              href="#sun-arc-subtitle"
              startOffset={incomingOffset}
              textAnchor="middle"
            >
              {incomingSubtitle}
            </textPath>
          </text>
        </g>
      </svg>
    </div>
  )
}

export default CurvedTitle
