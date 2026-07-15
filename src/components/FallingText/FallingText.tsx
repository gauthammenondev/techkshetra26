/**
 * FallingText — Physics-based text animation using Matter.js.
 *
 * Splits text into individual characters, each becoming a physics body.
 * On trigger, the bodies are released and bounce around the FULL VIEWPORT
 * with walls at every edge (bottom, left, right, top).
 *
 * Letters are positioned with `position: fixed` so they move freely
 * across the entire page, independent of the component's container.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import Matter from 'matter-js'

interface FallingTextProps {
  text: string
  highlightWords?: string[]
  highlightClass?: string
  trigger?: 'click' | 'hover' | 'auto' | 'scroll'
  backgroundColor?: string
  wireframes?: boolean
  gravity?: number
  fontSize?: string
  mouseConstraintStiffness?: number
  onFall?: () => void
  onTrigger?: () => void
  delayBeforeFall?: number
  externalTrigger?: boolean
}

export default function FallingText({
  text,
  highlightWords = [],
  highlightClass = 'highlighted',
  trigger = 'auto',
  backgroundColor = 'transparent',
  wireframes = false,
  gravity = 1,
  fontSize = '1rem',
  mouseConstraintStiffness: _mouseConstraintStiffness = 0.2,
  onFall,
  onTrigger,
  delayBeforeFall = 0,
  externalTrigger = false,
}: FallingTextProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasContainerRef = useRef<HTMLDivElement | null>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const runnerRef = useRef<Matter.Runner | null>(null)
  const [isTriggered, setIsTriggered] = useState(false)
  const [hasFallen, setHasFallen] = useState(false)
  const charSpansRef = useRef<(HTMLSpanElement | null)[]>([])
  const charBodiesRef = useRef<{ body: Matter.Body; el: HTMLSpanElement }[]>([])
  const animFrameRef = useRef<number | null>(null)

  // Split into characters
  const chars = text.split('')

  // Check if the entire word matches a highlight word
  const isHighlighted = highlightWords.some(
    (hw) => text.toLowerCase().includes(hw.toLowerCase())
  )

  const triggerFall = useCallback(() => {
    if (hasFallen) return
    setHasFallen(true)

    const canvasContainer = canvasContainerRef.current
    if (!canvasContainer) return

    // Use the FULL VIEWPORT as the physics world
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Create engine
    const engine = Matter.Engine.create({ gravity: { x: 0, y: gravity } })
    engineRef.current = engine

    // Create renderer (invisible — we sync DOM elements to body positions)
    const render = Matter.Render.create({
      element: canvasContainer,
      engine,
      options: {
        width: vw,
        height: vh,
        wireframes,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio,
      },
    })
    renderRef.current = render

    // Hide the canvas — we use DOM syncing
    render.canvas.style.opacity = '0'
    render.canvas.style.pointerEvents = 'none'
    render.canvas.style.position = 'fixed'

    // Walls at ALL viewport edges — letters bounce around the full page
    const wallOptions = { isStatic: true, render: { visible: false } }
    const thickness = 60
    const walls = [
      // bottom
      Matter.Bodies.rectangle(vw / 2, vh + thickness / 2, vw + 200, thickness, wallOptions),
      // left
      Matter.Bodies.rectangle(-thickness / 2, vh / 2, thickness, vh + 200, wallOptions),
      // right
      Matter.Bodies.rectangle(vw + thickness / 2, vh / 2, thickness, vh + 200, wallOptions),
      // top
      Matter.Bodies.rectangle(vw / 2, -thickness / 2, vw + 200, thickness, wallOptions),
    ]
    Matter.Composite.add(engine.world, walls)

    // Create bodies for each character — positions relative to viewport
    const spans = charSpansRef.current
    const pairs: { body: Matter.Body; el: HTMLSpanElement }[] = []

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i]
      if (!span) continue
      if (chars[i] === ' ') continue

      // getBoundingClientRect gives viewport-relative coords — perfect for fixed positioning
      const rect = span.getBoundingClientRect()
      const x = rect.left + rect.width / 2
      const y = rect.top + rect.height / 2
      const w = rect.width
      const h = rect.height

      const body = Matter.Bodies.rectangle(x, y, w, h, {
        restitution: 0.6,  // bouncy
        friction: 0.3,
        frictionAir: 0.008,
        render: { visible: false },
      })

      // Random initial velocities for a dramatic "explosion" crumble
      const vx = (Math.random() - 0.5) * 8
      const vy = (Math.random() - 0.5) * 6 - 2 // slight upward bias
      Matter.Body.setVelocity(body, { x: vx, y: vy })
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2)

      // Pre-set static styles to eliminate layout thrashing in requestAnimationFrame
      span.style.position = 'fixed'
      span.style.left = '0px'
      span.style.top = '0px'
      span.style.width = `${w}px`
      span.style.height = `${h}px`
      span.style.zIndex = '100'
      span.style.pointerEvents = 'none'
      span.style.willChange = 'transform'

      pairs.push({ body, el: span })
      Matter.Composite.add(engine.world, body)
    }

    charBodiesRef.current = pairs

    // Start the engine
    Matter.Render.run(render)
    const runner = Matter.Runner.create()
    runnerRef.current = runner
    Matter.Runner.run(runner, engine)

    // Sync DOM to physics bodies using GPU-accelerated transform
    const syncDOM = () => {
      for (const { body, el } of charBodiesRef.current) {
        const { x: bx, y: by } = body.position
        const angle = body.angle
        // We pre-set position: fixed and left:0/top:0 in the setup loop
        // translate() is much faster than setting left/top
        el.style.transform = `translate(${bx - el.offsetWidth / 2}px, ${by - el.offsetHeight / 2}px) rotate(${angle}rad)`
      }
      animFrameRef.current = requestAnimationFrame(syncDOM)
    }
    syncDOM()

    // Fire onFall callback after a brief delay
    setTimeout(() => {
      onFall?.()
    }, 400)
  }, [hasFallen, gravity, wireframes, onFall, chars])

  // Auto trigger
  useEffect(() => {
    if (trigger === 'auto' && !hasFallen) {
      const timer = setTimeout(triggerFall, 100)
      return () => clearTimeout(timer)
    }
  }, [trigger, hasFallen, triggerFall])

  // Scroll trigger
  useEffect(() => {
    if (trigger !== 'scroll' || hasFallen) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          triggerFall()
        }
      },
      { threshold: 0.5 }
    )

    const el = containerRef.current
    if (el) observer.observe(el)

    return () => {
      if (el) observer.unobserve(el)
    }
  }, [trigger, hasFallen, triggerFall])

  // Cleanup
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (renderRef.current) Matter.Render.stop(renderRef.current)
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current)
      if (engineRef.current) Matter.Engine.clear(engineRef.current)
    }
  }, [])

  const handleInteraction = () => {
    if (trigger === 'click' && !isTriggered) {
      setIsTriggered(true)
      onTrigger?.()
      if (delayBeforeFall > 0) {
        setTimeout(triggerFall, delayBeforeFall)
      } else {
        triggerFall()
      }
    }
  }

  // Handle external trigger
  useEffect(() => {
    if (externalTrigger && !isTriggered) {
      setIsTriggered(true)
      onTrigger?.()
      if (delayBeforeFall > 0) {
        setTimeout(triggerFall, delayBeforeFall)
      } else {
        triggerFall()
      }
    }
  }, [externalTrigger, isTriggered, onTrigger, delayBeforeFall, triggerFall])

  const handleMouseEnter = () => {
    if (trigger === 'hover') triggerFall()
  }

  return (
    <div
      ref={containerRef}
      onClick={handleInteraction}
      onMouseEnter={handleMouseEnter}
      style={{
        position: 'relative',
        overflow: 'visible', // letters escape to the full viewport
        background: backgroundColor,
        width: '100%',
        height: '100%',
        cursor: trigger === 'click' && !hasFallen ? 'pointer' : 'default',
      }}
    >
      {/* Invisible physics canvas (fixed to viewport) */}
      <div
        ref={canvasContainerRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 99,
        }}
      />

      {/* Visible text layer — individual characters */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize,
          lineHeight: 1.1,
          width: '100%',
          height: '100%',
          position: 'relative',
        }}
      >
        {chars.map((char, i) => (
          <span
            key={`${char}-${i}`}
            ref={(el) => {
              charSpansRef.current[i] = el
            }}
            className={isHighlighted ? highlightClass : undefined}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              userSelect: 'none',
            }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
