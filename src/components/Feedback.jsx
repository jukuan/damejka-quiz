import { t } from '../i18n'

export default function Feedback({ lang, feedback, isDoubleFirstPart }) {
  if (!feedback) return null
  return <div className={`feedback ${feedback.correct ? 'success' : 'error'}`}>
    <strong>{feedback.correct ? t(lang, 'correct') : t(lang, 'incorrect')}</strong>
    {!feedback.correct && <span>{t(lang, 'correctAnswer')} <b>{feedback.correctAnswer}</b></span>}
    {feedback.correct && isDoubleFirstPart && <span>{t(lang, 'nextPart')}</span>}
  </div>
}
