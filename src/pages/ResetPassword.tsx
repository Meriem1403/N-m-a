import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { AmbientLayer } from '../components/layout/AmbientLayer'
import { SmartField } from '../components/ui/SmartField'
import { useAuth } from '../store/AuthContext'

export function ResetPassword() {
  const { updatePassword, clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.')
      return
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.')
      return
    }
    setSubmitting(true)
    try {
      await updatePassword(password)
      clearPasswordRecovery()
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Impossible de mettre à jour le mot de passe.')
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
            <p className="workspace-sidebar-mark glow-text">NÉMÉA</p>
            <h1 className="app-login-card__title">Nouveau mot de passe</h1>
            <p className="app-login-card__subtitle">
              {done
                ? 'Mot de passe enregistré. Vous pouvez utiliser l’application.'
                : 'Choisissez un nouveau mot de passe pour votre compte.'}
            </p>
          </div>

          {done ? (
            <p className="text-sm text-emerald-300/90 text-center">Connexion en cours…</p>
          ) : (
            <form onSubmit={handleSubmit} className="app-login-form">
              <SmartField
                label="Nouveau mot de passe"
                type="password"
                value={password}
                onChange={setPassword}
                smartFormat={false}
                required
                placeholder="Au moins 6 caractères"
              />
              <SmartField
                label="Confirmer le mot de passe"
                type="password"
                value={confirm}
                onChange={setConfirm}
                smartFormat={false}
                required
                placeholder="Répétez le mot de passe"
              />
              {error && (
                <p className="app-login-form__error" role="alert">
                  {error}
                </p>
              )}
              <button
                type="submit"
                className="btn-primary w-full !rounded-xl inline-flex items-center justify-center gap-2"
                disabled={submitting}
              >
                <KeyRound size={18} aria-hidden />
                {submitting ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
