import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  suffix?: string
  duration?: number
  className?: string
}

export function AnimatedNumber({ value, suffix = '', duration = 1200, className }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setDisplay(value)
      prev.current = value
      return
    }

    const from = prev.current
    const to = value
    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (to - from) * eased))
      if (t < 1) requestAnimationFrame(tick)
      else prev.current = to
    }

    requestAnimationFrame(tick)
  }, [value, duration])

  return (
    <span className={className}>
      {display}{suffix}
    </span>
  )
}
