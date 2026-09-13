import { useMemo } from 'react'
import { t } from '../i18n'

const INCORRECT_KEYS = ['incorrect', 'incorrect2', 'incorrect3']

const pickIncorrectKey = () =>
  INCORRECT_KEYS[Math.floor(Math.random() * INCORRECT_KEYS.length)]

export default function Feedback({ lang, feedback, isDoubleFirstPart }) {
  // Re-pick only when a new feedback object arrives — never on re-render.
  const incorrectMessage = useMemo(
    () => t(lang, pickIncorrectKey()),
    // `feedback` identity changes on every submit, `lang` on language switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feedback, lang],
  )

  if (!feedback) return null

  return (
    <div className={`feedback ${feedback.correct ? 'success' : 'error'}`}>
      <strong>
        {feedback.correct ? t(lang, 'correct') : incorrectMessage}
      </strong>
      {!feedback.correct && (
        <span>
          {t(lang, 'correctAnswer')} <b>{feedback.correctAnswer}</b>
        </span>
      )}
      {feedback.correct && isDoubleFirstPart && (
        <span>{t(lang, 'nextPart')}</span>
      )}
    </div>
  )
}
