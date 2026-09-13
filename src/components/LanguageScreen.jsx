import Brand from './Brand'
import { SUPPORTED_LANGUAGES, t } from '../i18n'

export default function LanguageScreen({ onSelect }) {
  return (
    <main className="shell narrow">
      <Brand />
      <section className="card intro">
        <h2>{t('be', 'chooseLanguage')}</h2>
        <p>{t('be', 'languageHint')}</p>
        <div className="languages">
          {SUPPORTED_LANGUAGES.map((language) => (
            <button
              className="language"
              key={language.id}
              onClick={() => onSelect(language.id)}
            >
              <span>{language.flag}</span>
              <div>
                <b>{language.nativeName}</b>
                <small>{t(language.id, 'available')}</small>
              </div>
              <i>→</i>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
