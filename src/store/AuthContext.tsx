import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

interface AuthContextValue {
  /** Connexion cloud : login obligatoire. Mode démo local : pas d’auth. */
  requiresAuth: boolean
  authReady: boolean
  session: Session | null
  userEmail: string | null
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const requiresAuth = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(null)
  const [authReady, setAuthReady] = useState(!requiresAuth)

  useEffect(() => {
    if (!supabase) return

    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return
      setSession(data.session)
      setAuthReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthReady(true)
    })

    return () => {
      cancelled = true
      sub.subscription.unsubscribe()
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) throw new Error('Supabase non configuré')
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
  }, [])

  const value = useMemo(
    () => ({
      requiresAuth,
      authReady,
      session,
      userEmail: session?.user.email ?? null,
      signIn,
      signOut,
    }),
    [requiresAuth, authReady, session, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
