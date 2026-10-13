export function ProductionConfigRequired() {
  return (
    <div className="app-root app-login-root">
      <div className="app-login-screen foreground-layer">
        <div className="app-login-card nemea-panel nemea-panel--glow max-w-md">
          <h1 className="app-login-card__title text-lg">Application non sécurisée</h1>
          <p className="app-login-card__subtitle text-sm leading-relaxed mt-2">
            Ce site est en production sans connexion Supabase. Les données CRM ne doivent pas être accessibles
            sans authentification. Configurez{' '}
            <code className="text-indigo-200">VITE_SUPABASE_URL</code> et{' '}
            <code className="text-indigo-200">VITE_SUPABASE_ANON_KEY</code> sur Netlify, puis redéployez.
          </p>
        </div>
      </div>
    </div>
  )
}
