// Minimal URL-based language routing.
// URL shape:
//   /       → no language in URL (language picker)
//   /<lang> → specific language, skips the picker

export function getLangFromPath() {
  if (typeof window === 'undefined') return null
  const path = window.location.pathname.replace(/^\/+|\/+$/g, '')
  if (!path) return null
  return path.split('/')[0].toLowerCase() || null
}

/** Push a new history entry (so browser Back returns to the previous screen). */
export function navigateTo(lang) {
  const target = lang ? `/${lang}` : '/'
  if (window.location.pathname !== target) {
    window.history.pushState({ lang: lang ?? null }, '', target)
  }
}

/** Replace the current entry (no new history entry — used for redirects/exit). */
export function replaceTo(lang) {
  const target = lang ? `/${lang}` : '/'
  if (window.location.pathname !== target) {
    window.history.replaceState({ lang: lang ?? null }, '', target)
  }
}
