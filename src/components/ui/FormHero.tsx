import type { ReactNode } from 'react'
import { ProHeading } from './ProHeading'

type FormHeroVariant = 'profile' | 'property' | 'import' | 'search'

const illustrations: Record<FormHeroVariant, string> = {
  profile: '/illustrations/profile.svg',
  property: '/illustrations/property.svg',
  import: '/illustrations/import.svg',
  search: '/illustrations/search.svg',
}

interface FormHeroProps {
  variant: FormHeroVariant
  title: string
  subtitle?: string
  badge?: string
  children?: ReactNode
}

export function FormHero({ variant, title, subtitle, badge, children }: FormHeroProps) {
  return (
    <div className="form-hero">
      <div className="form-hero__backdrop" aria-hidden />
      <div className="form-hero__visual">
        <img src={illustrations[variant]} alt="" className="form-hero__img" />
        <div className="form-hero__glow" aria-hidden />
      </div>
      <div className="form-hero__content">
        <ProHeading
          variant="form"
          eyebrow={badge}
          title={title}
          subtitle={subtitle}
        />
        {children}
      </div>
    </div>
  )
}
