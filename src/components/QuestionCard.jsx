import QuestionOptions from './QuestionOptions'
import UnscrambleInput from './UnscrambleInput'
import Feedback from './Feedback'
import { t } from '../i18n'
import { categoryName } from '../data/categoryNames'

export default function QuestionCard({ lang, question, category, isDoubleFollowUp, selectedOption, userAnswer, scrambled, feedback, onOptionSelect, onAnswerChange, onSubmit }) {
  if (!question || !category) return <section className="card loading"><div className="spinner" />{t(lang, 'loading')}</section>
  return <section className="card question-card">
    <div className="category-row">
      <span className="category-pill" style={{ '--category-color': category.color }}>{category.icon} {categoryName(lang, category.id, category.name)}</span>
      {question.isDouble && !isDoubleFollowUp && <div className="double" aria-label={t(lang, 'double')}><i>?</i><i>?</i></div>}
      {isDoubleFollowUp && <span className="part">{t(lang, 'part2')}</span>}
    </div>
    <img className="question-image" src={question.image} alt="" />
    <div className="question-copy"><small>{isDoubleFollowUp ? t(lang, 'extraQuestion') : t(lang, 'question')}</small><h1>{question.question}</h1></div>
    {question.type === 'mcq' ? <QuestionOptions question={question} selectedOption={selectedOption} feedback={feedback} onSelect={onOptionSelect} /> : <UnscrambleInput lang={lang} scrambled={scrambled} value={userAnswer} disabled={Boolean(feedback)} onChange={onAnswerChange} onSubmit={onSubmit} />}
    <Feedback lang={lang} feedback={feedback} isDoubleFirstPart={question.isDouble && !isDoubleFollowUp} />
    {question.type === 'unscramble' && !feedback && <button className="submit" disabled={!userAnswer.trim()} onClick={onSubmit}>{t(lang, 'check')}</button>}
  </section>
}
