import { useEffect, useRef } from 'react'
import LanguageScreen from './components/LanguageScreen'
import DifficultyScreen from './components/DifficultyScreen'
import GameHeader from './components/GameHeader'
import Footer from './components/Footer'
import QuestionCard from './components/QuestionCard'
import RoundComplete from './components/RoundComplete'
import BackgroundCanvas from './components/BackgroundCanvas'
import './index.css'
import { initAnalytics, trackEvent } from './analytics'
import { useLanguage } from './hooks/useLanguage'
import { useInstallPrompt } from './hooks/useInstallPrompt'
import { useQuiz } from './hooks/useQuiz'

const Layout = ({ lang, children }) => (
  <>
    <BackgroundCanvas />
    {children}
    <Footer lang={lang} />
  </>
)

export default function App() {
  const language = useLanguage()
  const install = useInstallPrompt()
  const quiz = useQuiz({ lang: language.lang })

  // Initialize GA once.
  useEffect(() => {
    initAnalytics()
  }, [])

  // Fire round_completed exactly once when the quiz transitions.
  // (Reading quiz.* in the effect body is fine because the effect only
  // runs when phase actually changes — the previous value is captured in ref.)
  const prevPhaseRef = useRef(quiz.phase)
  useEffect(() => {
    if (
      quiz.phase === 'roundComplete' &&
      prevPhaseRef.current !== 'roundComplete'
    ) {
      trackEvent('round_completed', {
        round: quiz.currentRound,
        difficulty: quiz.difficulty,
        correct: quiz.correctAnswers,
        incorrect: quiz.incorrectAnswers,
      })
    }
    prevPhaseRef.current = quiz.phase
  }, [
    quiz.phase,
    quiz.currentRound,
    quiz.difficulty,
    quiz.correctAnswers,
    quiz.incorrectAnswers,
  ])

  // Browser Back/Forward → reset quiz, sync URL to state.
  useEffect(() => {
    const onPopState = () => {
      quiz.reset()
      language.syncFromUrl()
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [quiz, language])

  const restart = () => {
    quiz.reset()
    language.goToLanguage()
  }

  // Screen is derived — no explicit setScreen calls.
  const screen = !language.lang
    ? 'language'
    : quiz.phase === 'idle'
      ? 'difficulty'
      : quiz.phase === 'roundComplete'
        ? 'roundComplete'
        : 'question'

  if (screen === 'language') {
    return (
      <Layout lang={language.lang}>
        <LanguageScreen onSelect={language.chooseLanguage} />
      </Layout>
    )
  }

  if (screen === 'difficulty') {
    return (
      <Layout lang={language.lang}>
        <DifficultyScreen
          lang={language.lang}
          onBack={language.goToLanguage}
          onSelect={quiz.startFirstRound}
        />
      </Layout>
    )
  }

  if (screen === 'roundComplete') {
    return (
      <Layout lang={language.lang}>
        <RoundComplete
          lang={language.lang}
          round={quiz.currentRound}
          correctAnswers={quiz.correctAnswers}
          incorrectAnswers={quiz.incorrectAnswers}
          onNextRound={quiz.nextRound}
          onRestart={restart}
        />
      </Layout>
    )
  }

  return (
    <Layout lang={language.lang}>
      <main className="shell">
        <GameHeader
          lang={language.lang}
          round={quiz.currentRound}
          remainingCategories={quiz.remainingCategories}
          onExit={restart}
          onInstall={install.handleInstall}
          canInstall={install.canInstall}
          installed={install.installed}
        />
        <QuestionCard
          lang={language.lang}
          question={quiz.question}
          category={quiz.category}
          isDoubleFollowUp={quiz.isDoubleFollowUp}
          selectedOption={quiz.selectedOption}
          userAnswer={quiz.userAnswer}
          scrambled={quiz.scrambled}
          feedback={quiz.feedback}
          onOptionSelect={quiz.selectOption}
          onAnswerChange={quiz.setUserAnswer}
          onSubmit={() => quiz.submit()}
        />
      </main>
    </Layout>
  )
}
