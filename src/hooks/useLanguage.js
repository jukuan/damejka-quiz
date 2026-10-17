import { useCallback, useEffect, useState } from 'react'
import { SUPPORTED_LANGUAGES, t } from '../i18n'
import { getLangFromPath, navigateTo, replaceTo } from '../routing'
import { trackEvent, trackPageview } from '../analytics'

export const isKnownLang = (value) =>
  Boolean(value) && SUPPORTED_LANGUAGES.some((item) => item.id === value)

function readInitialLang() {
  const fromUrl = getLangFromPath()
  if (isKnownLang(fromUrl)) return fromUrl
  const stored = localStorage.getItem('damejka-lang')
  return isKnownLang(stored) ? stored : null
}

export function useLanguage() {
  const [lang, setLang] = useState(readInitialLang)

  // Normalize URL on first mount (localStorage → URL redirect).
  useEffect(() => {
    const fromUrl = getLangFromPath()
    if (lang && fromUrl !== lang) {
      replaceTo(lang)
    } else if (!lang && fromUrl) {
      replaceTo(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist, metadata, pageview — all keyed on the current language.
  useEffect(() => {
    if (!lang) return
    localStorage.setItem('damejka-lang', lang)
    document.documentElement.lang = lang
    document.title = t(lang, 'title')
    trackPageview(`/${lang}`)
  }, [lang])

  const chooseLanguage = useCallback((value) => {
    trackEvent('language_selected', { language: value })
    setLang(value)
    navigateTo(value)
  }, [])

  const goToLanguage = useCallback(() => {
    replaceTo(null)
    localStorage.removeItem('damejka-lang')
    setLang(null)
  }, [])

  // Used by App's popstate handler to sync URL → state.
  const syncFromUrl = useCallback(() => {
    const fromUrl = getLangFromPath()
    setLang(isKnownLang(fromUrl) ? fromUrl : null)
  }, [])

  return { lang, chooseLanguage, goToLanguage, syncFromUrl }
}
