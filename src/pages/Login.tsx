import { useState } from 'react'
import { LogIn, Shield } from 'lucide-react'
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
  const { signIn, requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [forgotMode, setForgotMode] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    try {
      if (forgotMode) {
        await requestPasswordReset(email)
        setInfo('Si un compte existe pour cet email, un lien de réinitialisation vient d’être envoyé.')
        setForgotMode(false)
      } else {
        await signIn(email, password)
      }
    } catch (err) {
      setError(formatAuthError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-root app-login-root">
      <div className="bg-layer">
        <AmbientLayer />
      </div>

      <div className="app-login-screen foreground-layer">
        <div className="app-login-card nemea-panel nemea-panel--glow">
          <div className="app-login-card__header">
            <div className="app-login-card__badge">
              <Shield size={14} aria-hidden />
              Espace sécurisé
            </div>
            <p className="workspace-sidebar-mark glow-text">NÉMÉA</p>
            <h1 className="app-login-card__title">Connexion</h1>
            <p className="app-login-card__subtitle">
              Accès réservé à votre équipe. Vos profils, recherches et biens sont synchronisés dans le cloud.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="app-login-form">
            <SmartField
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              required
              placeholder="vous@agence.fr"
            />
            {!forgotMode && (
              <SmartField
                label="Mot de passe"
                type="password"
                value={password}
                onChange={setPassword}
                smartFormat={false}
                required
                placeholder="Votre mot de passe"
              />
            )}

            {!forgotMode && (
              <button
                type="button"
                className="app-login-forgot"
                onClick={() => {
                  setForgotMode(true)
                  setError(null)
                  setInfo(null)
                }}
              >
                Mot de passe oublié ?
              </button>
            )}

            {forgotMode && (
              <button
                type="button"
                className="app-login-forgot"
                onClick={() => {
                  setForgotMode(false)
                  setError(null)
                }}
              >
                ← Retour à la connexion
              </button>
            )}

            {info && (
              <p className="app-login-form__info" role="status">
                {info}
              </p>
            )}

            {error && (
              <p className="app-login-form__error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary w-full !rounded-xl mt-1 inline-flex items-center justify-center gap-2"
              disabled={submitting}
            >
              <LogIn size={18} aria-hidden />
              {submitting
                ? forgotMode
                  ? 'Envoi…'
                  : 'Connexion…'
                : forgotMode
                  ? 'Envoyer le lien'
                  : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
