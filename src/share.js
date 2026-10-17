import { t } from './i18n'

export function buildShareUrl(lang) {
  const { origin } = window.location
  return lang ? `${origin}/${lang}` : origin
}

export function buildShareText(lang, { correct, incorrect, url }) {
  const total = correct + incorrect
  return t(lang, 'shareTemplate')
    .replaceAll('{correct}', String(correct))
    .replaceAll('{incorrect}', String(incorrect))
    .replaceAll('{total}', String(total))
    .replaceAll('{url}', url)
}

/**
 * Try to share via the native sheet, fall back to clipboard.
 * Never throws — always returns a status the caller can show.
 *
 * @returns {Promise<{ ok: boolean, method: 'native'|'clipboard'|'cancelled'|'error' }>}
 */
export async function shareResult(lang, { correct, incorrect }) {
  const url = buildShareUrl(lang)
  const text = buildShareText(lang, { correct, incorrect, url })
  const title = t(lang, 'shareTitle')

  if (navigator.share) {
    try {
      await navigator.share({ title, text })
      return { ok: true, method: 'native' }
    } catch (err) {
      if (err.name === 'AbortError') {
        return { ok: false, method: 'cancelled' }
      }
      // Any other error — fall through to clipboard.
    }
  }

  try {
    await navigator.clipboard.writeText(text)
    return { ok: true, method: 'clipboard' }
  } catch {
    return { ok: false, method: 'error' }
  }
}
