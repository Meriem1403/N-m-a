import { useEffect, useRef } from 'react'

const nebulae = [
  { top: '8%', left: '12%', size: 480, color: 'rgba(124, 127, 245, 0.14)' },
  { top: '55%', left: '72%', size: 520, color: 'rgba(192, 132, 252, 0.1)' },
  { top: '72%', left: '18%', size: 400, color: 'rgba(56, 189, 248, 0.08)' },
]

export function CosmicBackground() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0.5, y: 0.5 })
  const smooth = useRef({ x: 0.5, y: 0.5 })
  const rafId = useRef(0)

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reducedMotion) return

    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }

    const tick = () => {
      smooth.current.x += (mouse.current.x - smooth.current.x) * 0.03
      smooth.current.y += (mouse.current.y - smooth.current.y) * 0.03
      const el = parallaxRef.current
      if (el) {
        el.style.transform = `translate3d(${(smooth.current.x - 0.5) * 12}px, ${(smooth.current.y - 0.5) * 8}px, 0)`
      }
      rafId.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafId.current = requestAnimationFrame(tick)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div ref={parallaxRef} className="absolute inset-0 will-change-transform">
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99, 102, 241, 0.18) 0%, transparent 55%),
              radial-gradient(ellipse 50% 40% at 90% 90%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
              linear-gradient(180deg, rgba(22, 28, 40, 0.95) 0%, rgba(20, 24, 32, 0.98) 45%, rgba(19, 23, 34, 1) 100%)
            `,
          }}
        />
        {nebulae.map((n, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              top: n.top, left: n.left, width: n.size, height: n.size,
              background: `radial-gradient(circle, ${n.color} 0%, transparent 65%)`,
              transform: 'translate(-50%, -50%)', filter: 'blur(60px)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
