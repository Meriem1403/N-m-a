import { useState } from 'react'
import { Lock, LogIn } from 'lucide-react'
import { AmbientLayer } from '../components/layout/AmbientLayer'
import { SmartField } from '../components/ui/SmartField'
import { useAuth } from '../store/AuthContext'

function formatAuthError(err: unknown): string {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase()
    if (msg.includes('invalid login credentials')) {
      return 'Email ou mot de passe incorrect.'
    }
    if (msg.includes('email not confirmed')) {
      return 'Confirmez votre email via le lien reçu avant de vous connecter.'
    }
    return err.message
  }
  return 'Connexion impossible.'
}

export function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signIn(email, password)
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-root">
      <div className="bg-layer">
        <AmbientLayer />
      </div>
      <div className="app-loading-screen foreground-layer">
        <div className="nemea-panel app-login-panel">
          <p className="workspace-sidebar-mark glow-text text-center">NÉMÉA</p>
          <h1 className="nemea-panel-title text-center mt-3">Connexion sécurisée</h1>
          <p className="text-xs text-nemea-subtle text-center mt-2 mb-6">
            Accès réservé à votre équipe. Les données ne sont plus accessibles sans identifiants.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <SmartField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="vous@agence.fr"
            />
            <label className="smart-field">
              <span className="smart-field__label">Mot de passe</span>
              <div className="smart-field__control">
                <Lock size={16} className="smart-field__icon" aria-hidden />
                <input
                  className="smart-field__input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error && (
              <p className="text-xs text-red-300" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full !rounded-xl mt-2 inline-flex items-center justify-center gap-2" disabled={submitting}>
              <LogIn size={18} aria-hidden />
              {submitting ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
