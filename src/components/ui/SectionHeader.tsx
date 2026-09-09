import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProHeading } from './ProHeading'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  href?: string
  linkLabel?: string
}

export function SectionHeader({ title, subtitle, href, linkLabel = 'Voir tout' }: SectionHeaderProps) {
  return (
    <div className="pro-section-header">
      <ProHeading variant="section" title={title} subtitle={subtitle} animated={false} />
      {href && (
        <Link to={href} className="pro-section-header__link btn-ghost shrink-0">
          {linkLabel}
          <ArrowRight size={14} />
        </Link>
      )}
    </div>
  )
}
