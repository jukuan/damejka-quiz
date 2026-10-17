import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'
import { shareResult } from '../share'

export default function ShareButton({ lang, correct, incorrect }) {
  const [status, setStatus] = useState(null) // 'copied' | 'error' | null
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const handleClick = async () => {
    const result = await shareResult(lang, { correct, incorrect })

    // Native share shows its own UI — no toast needed.
    if (result.method === 'native' || result.method === 'cancelled') return

    setStatus(result.method === 'clipboard' ? 'copied' : 'error')
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="share">
      <button className="primary" onClick={handleClick}>
        {t(lang, 'share')}
      </button>
      {status && (
        <p className={`share-status ${status}`} role="status">
          {status === 'copied' ? t(lang, 'shareCopied') : t(lang, 'shareError')}
        </p>
      )}
    </div>
  )
}
