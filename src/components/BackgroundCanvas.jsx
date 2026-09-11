import { useEffect, useRef } from 'react'

const CIRCLE_COUNT = 28

export default function BackgroundCanvas() {
  const canvasRef = useRef(null)
  const circlesRef = useRef([])
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const randomGray = () => {
      const g = Math.floor(Math.random() * 128) + 128
      return `rgb(${g},${g},${g})`
    }

    const makeCircle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: Math.random() - 0.5,
      vy: Math.random() - 0.5,
      radius: Math.random() * 100 + 10,
      color: randomGray(),
    })

    const resize = () => {
      // Scale the canvas so it stays crisp on high-DPI screens.
      const w = window.innerWidth
      const h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Keep existing circles inside the new bounds.
      for (const c of circlesRef.current) {
        c.x = Math.min(c.x, w)
        c.y = Math.min(c.y, h)
      }
    }

    const drawCircle = (c) => {
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.radius, 0, 2 * Math.PI, false)
      ctx.fillStyle = c.color
      ctx.fill()
    }

    const step = () => {
      const w = canvas.width / dpr
      const h = canvas.height / dpr

      ctx.clearRect(0, 0, w, h)

      for (const c of circlesRef.current) {
        c.x += c.vx
        c.y += c.vy

        // Wrap around the edges so circles never disappear.
        if (c.x < -c.radius) c.x = w + c.radius
        else if (c.x > w + c.radius) c.x = -c.radius
        if (c.y < -c.radius) c.y = h + c.radius
        else if (c.y > h + c.radius) c.y = -c.radius

        drawCircle(c)
      }

      rafRef.current = requestAnimationFrame(step)
    }

    // Seed circles once we know the viewport size.
    resize()
    circlesRef.current = Array.from({ length: CIRCLE_COUNT }, makeCircle)

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    window.addEventListener('resize', resize)

    if (prefersReducedMotion) {
      // Draw a single frame so the user still sees the slogan + dots.
      for (const c of circlesRef.current) drawCircle(c)
    } else {
      rafRef.current = requestAnimationFrame(step)
    }

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="background-canvas"
      aria-hidden="true"
    />
  )
}
