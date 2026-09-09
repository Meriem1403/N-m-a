import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { ProHeading } from './ProHeading'

interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
  animated?: boolean
  /** @deprecated Le style pro est appliqué par défaut */
  gradient?: boolean
}

export function PageHeader({ eyebrow, title, subtitle, icon, action, animated = false }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'page-header',
        action ? 'page-header--with-action' : undefined,
      )}
    >
      <ProHeading
        variant="page"
        eyebrow={eyebrow}
        title={title}
        subtitle={subtitle}
        icon={icon}
        animated={animated}
      />
      {action && <div className="page-header__action">{action}</div>}
    </header>
  )
}
