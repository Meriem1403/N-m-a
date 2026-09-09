import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="nemea-panel text-center py-16 animate-fade-up">
      <p className="text-6xl font-bold glow-text opacity-40">404</p>
      <h1 className="text-xl font-semibold text-white mt-4">Page introuvable</h1>
      <p className="text-sm text-nemea-subtle mt-2 max-w-sm mx-auto">Cette page n'existe pas ou a été déplacée.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Retour à l'accueil</Link>
    </div>
  )
}
