import { useCallback, useEffect, useState } from 'react'
import { registerServiceWorker } from '../pwa'

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(
    () =>
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true,
  )

  useEffect(() => {
    registerServiceWorker()

    const handleBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome !== 'accepted') setInstallPrompt(null)
  }, [installPrompt])

  return {
    canInstall: Boolean(installPrompt),
    installed,
    handleInstall,
  }
}
