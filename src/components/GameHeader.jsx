import { categories } from '../data/be/questions'
import { SUPPORTED_LANGUAGES, t } from '../i18n'

export default function GameHeader({ lang, round, remainingCategories, onExit, onInstall, canInstall, installed }) {
  const language = SUPPORTED_LANGUAGES.find((item) => item.id === lang)
  return <header className="game-header">
    <button className="ghost" onClick={onExit}>{t(lang, 'exit')}</button>
    <span className="round">{t(lang, 'round')} {round}</span>
    <div className="header-actions">
      {canInstall && <button className="install-button" onClick={onInstall}>{t(lang, 'install')}</button>}
      {installed && <span className="installed">✓</span>}
      <span className="language-mini">{language?.flag}</span>
    </div>
    <div className="dots" aria-label={t(lang, 'progress')}>
      {categories.map((category) => <span key={category.id} className={!remainingCategories.includes(category.id) ? 'done' : ''} />)}
    </div>
  </header>
}
