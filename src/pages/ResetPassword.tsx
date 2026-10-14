import { useEffect, useState } from 'react'
import { KeyRound } from 'lucide-react'
import { AmbientLayer } from '../components/layout/AmbientLayer'
import { SmartField } from '../components/ui/SmartField'
import { redirectRecoveryCallbackToResetPage, establishRecoverySession } from '../lib/recoverySession'
import { supabase } from '../lib/supabase'
import { useAuth } from '../store/AuthContext'

function friendlyAuthError(message: string): string {
  if (/auth session missing/i.test(message)) {
    return 'Lien expiré ou déjà utilisé. Demandez un nouveau mail « Mot de passe oublié » et ouvrez le lien tout de suite (une seule fois).'
  }
  if (/code challenge|verifier|invalid flow/i.test(message)) {
    return 'Ouvrez le lien dans Chrome/Safari (pas un aperçu intégré au mail), ou redemandez un e-mail de réinitialisation.'
  }
  return message
}

export function ResetPassword() {
  const { authReady, session, updatePassword, clearPasswordRecovery } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [linkValidated, setLinkValidated] = useState(false)

  useEffect(() => {
    redirectRecoveryCallbackToResetPage()
  }, [])

  useEffect(() => {
    if (!supabase) return
    let cancelled = false

    const finish = (ok: boolean, err?: string) => {
      if (cancelled) return
      if (ok) setLinkValidated(true)
      if (err) setError(friendlyAuthError(err))
    }

    const { data: authSub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY' || (nextSession && event === 'SIGNED_IN')) {
        finish(true)
      }
    })

    void (async () => {
      const result = await establishRecoverySession()
      if (cancelled) return
      if (result?.ok) {
        finish(true)
        return
      }
      if (result && !result.ok) {
        finish(false, result.error)
      }
    })()

    const timeout = window.setTimeout(() => {
      if (cancelled || linkValidated) return
      void establishRecoverySession().then((result) => {
        if (cancelled) return
        if (result?.ok) finish(true)
        else if (!session && !linkValidated) {
          finish(
            false,
            'Lien invalide ou expiré. Dans Supabase → Authentication → URL Configuration, ajoutez : https://oracle-nemea.netlify.app/reinitialiser-mot-de-passe puis redemandez un e-mail.',
          )
        }
      })
    }, 6000)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      authSub.subscription.unsubscribe()
    }
  }, [linkValidated, session])

  useEffect(() => {
    if (session) setLinkValidated(true)
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!session) {
      setError('Session absente. Rouvrez le lien reçu par e-mail ou demandez-en un nouveau.')
      return
    }
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
      window.setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      setError(friendlyAuthError(err instanceof Error ? err.message : 'Impossible de mettre à jour le mot de passe.'))
    } finally {
      setSubmitting(false)
    }
  }

  const waitingForLink = authReady && !linkValidated && !error && !done

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
                ? 'Mot de passe enregistré. Redirection…'
                : waitingForLink
                  ? 'Validation du lien sécurisé…'
                  : 'Choisissez un nouveau mot de passe pour votre compte.'}
            </p>
          </div>

          {done ? (
            <p className="text-sm text-emerald-300/90 text-center">Connexion en cours…</p>
          ) : waitingForLink ? (
            <p className="text-sm text-nemea-subtle text-center">Patientez quelques secondes.</p>
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
                disabled={submitting || !linkValidated || !session}
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
