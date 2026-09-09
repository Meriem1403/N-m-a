import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface FormSectionProps {
  icon: LucideIcon
  title: string
  description?: string
  step?: number
  children: ReactNode
  className?: string
}

export function FormSection({ icon: Icon, title, description, step, children, className }: FormSectionProps) {
  return (
    <section className={cn('form-section nemea-panel', className)}>
      <header className="form-section__header">
        <div className="form-section__icon-wrap">
          {step !== undefined && <span className="form-section__step">{step}</span>}
          <Icon size={18} strokeWidth={1.75} aria-hidden />
        </div>
        <div className="form-section__titles min-w-0">
          <div className="pro-heading pro-heading--inline">
            <h3 className="pro-heading__title pro-heading__title--sm">
              <span className="pro-heading__title-text">{title}</span>
            </h3>
            {description && (
              <p className="pro-heading__lead pro-heading__lead--sm">
                <span className="pro-heading__lead-text">{description}</span>
              </p>
            )}
          </div>
        </div>
      </header>
      <div className="form-section__body">{children}</div>
    </section>
  )
}
