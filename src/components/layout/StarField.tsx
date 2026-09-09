import { useEffect, useRef } from 'react'

interface Star {
  x: number; y: number; size: number; opacity: number
  twinkleSpeed: number; twinkleOffset: number; layer: number; hue: number
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let stars: Star[] = []
    let rafId = 0
    let lastFrame = 0
    const frameInterval = 1000 / (reducedMotion ? 15 : 30)
    const mouse = { x: 0.5, y: 0.5 }
    const smooth = { x: 0.5, y: 0.5 }

    const initStars = (w: number, h: number) => {
      const area = w * h
      stars = []
      const layers = [
        { count: Math.floor(area / 14000), sizeMin: 0.3, sizeMax: 0.9, layer: 0 },
        { count: Math.floor(area / 10000), sizeMin: 0.6, sizeMax: 1.5, layer: 1 },
        { count: Math.floor(area / 20000), sizeMin: 1.1, sizeMax: 2, layer: 2 },
      ]
      layers.forEach(({ count, sizeMin, sizeMax, layer }) => {
        for (let i = 0; i < count; i++) {
          const roll = Math.random()
          stars.push({
            x: Math.random() * w, y: Math.random() * h,
            size: Math.random() * (sizeMax - sizeMin) + sizeMin,
            opacity: Math.random() * 0.4 + (layer === 2 ? 0.35 : 0.15),
            twinkleSpeed: Math.random() * 0.012 + 0.004,
            twinkleOffset: Math.random() * Math.PI * 2,
            layer, hue: roll > 0.88 ? 240 : roll > 0.76 ? 260 : 0,
          })
        }
      })
      stars.sort((a, b) => a.layer - b.layer)
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      canvas.style.width = `${window.innerWidth}px`
      canvas.style.height = `${window.innerHeight}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars(window.innerWidth, window.innerHeight)
    }

    const draw = (time: number) => {
      rafId = requestAnimationFrame(draw)
      if (time - lastFrame < frameInterval) return
      lastFrame = time
      const w = window.innerWidth, h = window.innerHeight
      smooth.x += (mouse.x - smooth.x) * (reducedMotion ? 1 : 0.05)
      smooth.y += (mouse.y - smooth.y) * (reducedMotion ? 1 : 0.05)
      const px = (smooth.x - 0.5) * 2, py = (smooth.y - 0.5) * 2
      ctx.clearRect(0, 0, w, h)
      stars.forEach((star) => {
        const depth = star.layer + 1
        const sx = star.x + px * depth * 16
        const sy = star.y + py * depth * 16
        const twinkle = reducedMotion ? 1 : 0.65 + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.35
        const opacity = star.opacity * twinkle
        ctx.fillStyle = star.hue === 0 ? `rgba(255,255,255,${opacity})` : `hsla(${star.hue},70%,82%,${opacity})`
        ctx.beginPath()
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth
      mouse.y = e.clientY / window.innerHeight
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    rafId = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return <canvas ref={canvasRef} className="starfield-canvas absolute inset-0 pointer-events-none" aria-hidden />
}
