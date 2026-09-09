import { Sparkles, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProHeading } from './ProHeading'

interface DashboardHeroProps {
  matchCount: number
  profileCount: number
}

function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function formatToday(): string {
  const raw = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date())
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function DashboardHero({ matchCount, profileCount }: DashboardHeroProps) {
  const subtitle = matchCount > 0
    ? `${matchCount} correspondance${matchCount > 1 ? 's' : ''} prête${matchCount > 1 ? 's' : ''}. Vos prospects les plus pertinents sont identifiés.`
    : `${profileCount} profil${profileCount > 1 ? 's' : ''} en base. Ajoutez des biens pour lancer les correspondances.`

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero__aurora" aria-hidden />
      <div className="dashboard-hero__mesh" aria-hidden />
      <div className="dashboard-hero__content">
        <ProHeading
          variant="hero"
          eyebrow={formatToday()}
          title={<>{greeting()}<span className="pro-heading__title-punct">.</span></>}
          subtitle={subtitle}
        />
        <div className="dashboard-hero__actions">
          <Link to="/import" className="btn-primary dashboard-hero__cta">
            <Zap size={16} />
            Import rapide
          </Link>
          <Link to="/correspondances" className="btn-ghost dashboard-hero__cta-secondary">
            Voir les matchs
          </Link>
        </div>
      </div>
      <div className="dashboard-hero__visual" aria-hidden>
        <div className="dashboard-hero__ring dashboard-hero__ring--1" />
        <div className="dashboard-hero__ring dashboard-hero__ring--2" />
        <div className="dashboard-hero__core">
          <Sparkles size={28} strokeWidth={1.5} />
        </div>
      </div>
    </section>
  )
}
