import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function authStorage() {
  if (typeof window === 'undefined') return undefined
  // Session par onglet : évite qu’un navigateur partagé reste connecté indéfiniment.
  // Mettre VITE_AUTH_STORAGE=local pour garder la connexion après fermeture du navigateur.
  return import.meta.env.VITE_AUTH_STORAGE === 'local' ? window.localStorage : window.sessionStorage
}

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          flowType: 'pkce',
          detectSessionInUrl: true,
          persistSession: true,
          autoRefreshToken: true,
          storage: authStorage(),
          storageKey: `nemea-auth-${new URL(supabaseUrl).hostname}`,
        },
      })
    : null

export const isSupabaseConfigured = () => supabase !== null
