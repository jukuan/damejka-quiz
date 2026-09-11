import { SUPPORTED_LANGUAGES, t } from '../i18n'

const difficulties = [
  ['easy', '🌱'], ['medium', '⚡'], ['hard', '🔥'],
]

export default function DifficultyScreen({ lang, onBack, onSelect }) {
  const language = SUPPORTED_LANGUAGES.find((item) => item.id === lang)
  return (
    <main className="shell narrow">
      <header className="top">
        <button className="ghost" onClick={onBack}>{t(lang, 'back')}</button>
        <span>{language?.nativeName} {language?.flag}</span>
      </header>
      <section className="card intro">
        <small className="step">{t(lang, 'step')}</small>
        <h2>{t(lang, 'chooseDifficulty')}</h2>
        <p>{t(lang, 'difficultyHint')}</p>
        <div className="difficulties">
          {difficulties.map(([id, icon]) => (
            <button className="difficulty" key={id} onClick={() => onSelect(id)}>
              <span>{icon}</span><div><b>{t(lang, id)}</b><small>{t(lang, `${id}Hint`)}</small></div><i>→</i>
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}
