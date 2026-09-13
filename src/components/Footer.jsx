import { useState } from 'react'
import { t } from '../i18n'
import * as Sentry from '@sentry/react';

export default function Footer({ lang }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <footer className="site-footer">
        <button className="footer-link" onClick={() => setOpen(true)}>
          {t(lang, 'aboutQuiz')}
        </button>
        <button
      onClick={() => {
        throw new Error('This is your first error!');
      }}
    >
      Break the world
    </button>
      </footer>

      {open && (
        <div className="about-backdrop" onClick={() => setOpen(false)}>
          <div className="about-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{t(lang, 'aboutTitle')}</h2>
            <p>{t(lang, 'aboutBody')}</p>
            <p>
              {t(lang, 'authors')}:{' '}
              <a href="mailto:Cimafiej@gmail.com">Cimafiej@gmail.com</a>,{' '}
              <a href="mailto:y.misiukevich@gmail.com">
                y.misiukevich@gmail.com
              </a>
            </p>
            <button className="about-close" onClick={() => setOpen(false)}>
              {t(lang, 'close')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
