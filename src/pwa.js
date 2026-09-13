let refreshing = false
let listening = false

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return
  if (import.meta.env.DEV) return

  // Guard against multiple registrations (React StrictMode, HMR, etc.).
  if (!listening) {
    listening = true

    // Only reload if a controller already existed when the page loaded.
    // That way we don't reload on the very first install.
    const hadController = Boolean(navigator.serviceWorker.controller)

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) return
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }

  const register = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')

      // Force a check for a new /sw.js on every load; the browser's default
      // is once per 24h, which is too slow for frequent deploys.
      registration.update().catch(() => {
        // Offline or transient network error — retry on next load.
      })
    } catch (error) {
      console.warn('Damejka SW registration failed:', error)
    }
  }

  if (document.readyState === 'complete') register()
  else window.addEventListener('load', register, { once: true })
}
