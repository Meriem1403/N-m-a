import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PageBackLinkProps {
  to: string
  label: string
}

export function PageBackLink({ to, label }: PageBackLinkProps) {
  return (
    <Link to={to} className="page-back-link">
      <ChevronLeft size={18} strokeWidth={2} aria-hidden />
      <span>{label}</span>
    </Link>
  )
}
