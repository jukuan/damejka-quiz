import { t } from '../i18n'
export default function RoundComplete({ lang, round, correctAnswers, incorrectAnswers, onNextRound, onRestart }) {
  const total = correctAnswers + incorrectAnswers
  return <main className="shell narrow"><section className="card complete"><div className="trophy">🏆</div><small className="step">{t(lang, 'roundFinished')} {round}</small><h1>{t(lang, 'great')}</h1><p>{t(lang, 'roundDescription')}</p><div className="score"><div className="score-item correct-score"><strong>{correctAnswers}</strong><span>{t(lang, 'right')}</span></div><div className="score-divider" /><div className="score-item incorrect-score"><strong>{incorrectAnswers}</strong><span>{t(lang, 'wrong')}</span></div></div><div className="score-total">{t(lang, 'totalAnswers')} <b>{total}</b></div><button className="primary" onClick={onNextRound}>{t(lang, 'nextRound')}</button><button className="text-button" onClick={onRestart}>{t(lang, 'restart')}</button></section></main>
}
