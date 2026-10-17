const MEASUREMENT_ID = 'G-1L8TQTRHKY'
let initialized = false

export function initAnalytics() {
  if (!import.meta.env.PROD) return
  if (initialized) return
  if (typeof window === 'undefined') return
  if (navigator.doNotTrack === '1') return

  initialized = true

  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    window.dataLayer.push(arguments)
  }

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.appendChild(script)

  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, {
    // We send pageviews manually on route change; the default auto-pageview
    // would double-count in an SPA.
    send_page_view: false,
  })
}

export function trackPageview(path) {
  if (!window.gtag) return
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  })
}

export function trackEvent(name, params = {}) {
  if (!window.gtag) return
  window.gtag('event', name, params)
}
