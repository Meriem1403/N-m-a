import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export type ProHeadingVariant = 'page' | 'section' | 'form' | 'hero' | 'detail'

interface ProHeadingProps {
  variant?: ProHeadingVariant
  eyebrow?: string
  title: ReactNode
  subtitle?: string
  icon?: ReactNode
  className?: string
  animated?: boolean
}

export function ProHeading({
  variant = 'page',
  eyebrow,
  title,
  subtitle,
  icon,
  className,
  animated = true,
}: ProHeadingProps) {
  if (variant === 'section') {
    return (
      <div className={cn('pro-heading pro-heading--section', className)}>
        <div className="pro-heading__section-row">
          <h2 className="pro-heading__section-title">{title}</h2>
          <span className="pro-heading__section-line" aria-hidden />
        </div>
        {subtitle && <p className="pro-heading__section-sub">{subtitle}</p>}
      </div>
    )
  }

  const Tag = variant === 'form' ? 'h2' : 'h1'

  return (
    <div
      className={cn(
        'pro-heading',
        `pro-heading--${variant}`,
        animated && 'pro-heading--animated',
        className,
      )}
    >
      {eyebrow && (
        <div className="pro-heading__meta">
          <span className="pro-heading__line" aria-hidden />
          <span className="pro-heading__dot" aria-hidden />
          <span className="pro-heading__eyebrow">{eyebrow}</span>
        </div>
      )}

      <Tag className="pro-heading__title">
        {icon && <span className="pro-heading__icon">{icon}</span>}
        <span className="pro-heading__title-text">{title}</span>
      </Tag>

      {subtitle && (
        <p className="pro-heading__lead">
          <span className="pro-heading__lead-accent" aria-hidden />
          <span className="pro-heading__lead-text">{subtitle}</span>
        </p>
      )}
    </div>
  )
}
