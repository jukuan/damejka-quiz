import { Sentry } from './sentry'

const SW_URL = '/sw.js'

function reportError(error, context = {}) {
  if (import.meta.env.DEV) {
    console.warn('Damejka SW error:', error, context)
  }
  Sentry.captureException(error, { extra: context })
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (import.meta.env.DEV) return // don't fight HMR in dev

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register(SW_URL)

      // Check for a new version on every load so updates land promptly.
      registration.update().catch(() => {
        // Network hiccup — fine, will retry on next load.
      })

      // Fired when a new SW is found and finishes installing.
      registration.addEventListener('updatefound', () => {
        const next = registration.installing
        if (!next) return

        next.addEventListener('statechange', () => {
          if (next.state !== 'installed') return

          // If a controller exists, this is an update, not a first install.
          if (navigator.serviceWorker.controller) {
            // Optional: show a toast "New version available — reload".
            // For now, just log it.
            console.warn('Damejka: new version ready, reload to apply.')
          }
        })
      })
    } catch (error) {
      reportError(error, { stage: 'register' })
    }
  }

  if (document.readyState === 'complete') {
    register()
  } else {
    window.addEventListener('load', register, { once: true })
  }
}
