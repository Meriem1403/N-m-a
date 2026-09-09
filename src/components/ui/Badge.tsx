import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'accent' | 'success' | 'muted' | 'alert'
  className?: string
}

const variants = {
  default: 'nemea-badge nemea-badge--muted',
  accent: 'nemea-badge nemea-badge--accent',
  success: 'nemea-badge nemea-badge--success',
  muted: 'nemea-badge nemea-badge--muted',
  alert: 'nemea-badge nemea-badge--alert',
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return <span className={cn(variants[variant], className)}>{children}</span>
}
