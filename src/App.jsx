import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LanguageScreen from './components/LanguageScreen'
import DifficultyScreen from './components/DifficultyScreen'
import GameHeader from './components/GameHeader'
import QuestionCard from './components/QuestionCard'
import RoundComplete from './components/RoundComplete'
import './index.css'
import { registerServiceWorker } from './pwa'
import { SUPPORTED_LANGUAGES } from './i18n'
import BackgroundCanvas from './components/BackgroundCanvas'

const CORRECT_DELAY = 1000
const WRONG_DELAY = 1500

const DEFAULT_LANG = 'be'

const pickRandom = (items) => items[Math.floor(Math.random() * items.length)]

// Eagerly import every language's question pack that exists at build time.
// Vite rewrites this into static imports for each matching file, so
// `questionModules['./data/de/questions.js']` etc. are available synchronously.
const questionModules = import.meta.glob('./data/*/questions.js', { eager: true })

/**
 * Return the question pack for a language, falling back to the default
 * language if the requested one has no pack.
 */
const getQuestionPack = (lang) => {
  const requestedKey = `./data/${lang}/questions.js`
  const fallbackKey = `./data/${DEFAULT_LANG}/questions.js`
  const mod = questionModules[requestedKey] || questionModules[fallbackKey]

  if (!mod) {
    // Extremely unlikely, but we don't want the app to crash.
    return {
      categories: [],
      questions: [],
      scrambleWord: (word) => word,
    }
  }

  return {
    categories: mod.categories || [],
    questions: mod.questions || [],
    scrambleWord: mod.scrambleWord || ((word) => word),
  }
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('damejka-lang') || null)
  const [installPrompt, setInstallPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [difficulty, setDifficulty] = useState(null)
  const [screen, setScreen] = useState(() =>
    localStorage.getItem('damejka-lang') ? 'difficulty' : 'language',
  )

  const [currentRound, setCurrentRound] = useState(0)
  const [remainingCategories, setRemainingCategories] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)

  const [isDoubleFollowUp, setIsDoubleFollowUp] = useState(false)
  const [pendingCategoryCompletion, setPendingCategoryCompletion] = useState(null)

  const [selectedOption, setSelectedOption] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [scrambled, setScrambled] = useState('')

  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)

  const timer = useRef(null)

  // ---- Question pack for the current language -------------------------------
  // Recomputes whenever `lang` changes, and gives us fresh categories,
  // questions and the scramble helper for that language.
  const { categories, questions, scrambleWord } = useMemo(
    () => getQuestionPack(lang || DEFAULT_LANG),
    [lang],
  )

  const getPool = useCallback(
    (categoryId, difficultyValue) =>
      questions.filter(
        (question) =>
          question.category === categoryId &&
          question.difficulty === difficultyValue,
      ),
    [questions],
  )

  // ---- PWA / install prompt -------------------------------------------------
  useEffect(() => {
    registerServiceWorker()

    const handleBeforeInstall = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    setInstalled(
      window.matchMedia?.('(display-mode: standalone)').matches ||
        window.navigator.standalone === true,
    )

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  // ---- Persist language and update document metadata ------------------------
  useEffect(() => {
    if (!lang) return
    localStorage.setItem('damejka-lang', lang)
    const language = SUPPORTED_LANGUAGES.find((item) => item.id === lang)
    document.documentElement.lang = lang
    document.title = `Дамейка — ${language?.nativeName || 'Quiz'}`
  }, [lang])

  const handleInstall = useCallback(async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome !== 'accepted') setInstallPrompt(null)
  }, [installPrompt])

  const getCategory = useCallback(
    (id) => categories.find((category) => category.id === id),
    [categories],
  )

  const category = useMemo(
    () => getCategory(activeCategoryId),
    [activeCategoryId, getCategory],
  )

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => clearTimer, [clearTimer])

  // ---- Loading and advancing ------------------------------------------------
  const loadQuestion = useCallback(
    (categoryId, difficultyValue, questionOverride = null) => {
      const pool = getPool(categoryId, difficultyValue)
      if (!pool.length) return false

      const question = questionOverride || pickRandom(pool)

      setActiveCategoryId(categoryId)
      setActiveQuestion(question)
      setIsDoubleFollowUp(Boolean(questionOverride))
      setPendingCategoryCompletion(questionOverride ? categoryId : null)

      setSelectedOption(null)
      setUserAnswer('')
      setFeedback(null)

      setScrambled(
        question.type === 'unscramble'
          ? question.scrambled || scrambleWord(question.correctAnswer)
          : '',
      )

      setScreen('question')
      return true
    },
    [getPool, scrambleWord],
  )

  const startNewRound = useCallback(
    (difficultyValue = difficulty) => {
      const availableCategories = categories
        .filter((item) => getPool(item.id, difficultyValue).length > 0)
        .map((item) => item.id)

      setCurrentRound((round) => round + 1)
      setRemainingCategories(availableCategories)
      setActiveCategoryId(null)
      setActiveQuestion(null)
      setFeedback(null)
      setPendingCategoryCompletion(null)
      setIsDoubleFollowUp(false)

      setCorrectAnswers(0)
      setIncorrectAnswers(0)

      setScreen('question')
    },
    [categories, difficulty, getPool],
  )

  // Once a round has started, pick the first random category for it.
  useEffect(() => {
    if (
      screen !== 'question' ||
      activeQuestion ||
      !difficulty ||
      !remainingCategories.length
    ) {
      return
    }

    loadQuestion(pickRandom(remainingCategories), difficulty)
  }, [
    screen,
    activeQuestion,
    difficulty,
    remainingCategories,
    loadQuestion,
  ])

  const finishRound = useCallback(() => {
    clearTimer()
    setActiveQuestion(null)
    setActiveCategoryId(null)
    setScreen('roundComplete')
  }, [clearTimer])

  const advance = useCallback(
    (categoryId, completed, delay) => {
      clearTimer()

      const nextCategories = completed
        ? remainingCategories.filter((id) => id !== categoryId)
        : remainingCategories

      setRemainingCategories(nextCategories)

      // Avoid immediately repeating the same category.
      const candidates = nextCategories.filter((id) => id !== categoryId)

      timer.current = setTimeout(() => {
        if (!candidates.length) {
          finishRound()
          return
        }

        loadQuestion(pickRandom(candidates), difficulty)
      }, delay)
    },
    [
      clearTimer,
      difficulty,
      finishRound,
      loadQuestion,
      remainingCategories,
    ],
  )

  const handleSubmit = useCallback(
    (optionIndex = null) => {
      if (!activeQuestion || feedback) return

      const isCorrect =
        activeQuestion.type === 'mcq'
          ? optionIndex === activeQuestion.correctIndex
          : userAnswer.trim().toLocaleLowerCase() ===
            activeQuestion.correctAnswer.trim().toLocaleLowerCase()

      const correctAnswer =
        activeQuestion.type === 'mcq'
          ? activeQuestion.options[activeQuestion.correctIndex]
          : activeQuestion.correctAnswer

      setFeedback({ correct: isCorrect, correctAnswer })

      if (isCorrect) {
        setCorrectAnswers((count) => count + 1)
      } else {
        setIncorrectAnswers((count) => count + 1)
      }

      if (!isCorrect) {
        // A wrong answer doesn't complete the category; move on.
        advance(activeCategoryId, false, WRONG_DELAY)
        return
      }

      if (activeQuestion.isDouble && !isDoubleFollowUp) {
        clearTimer()
        timer.current = setTimeout(() => {
          const followUp = activeQuestion.followUp
          if (!followUp) {
            advance(activeCategoryId, true, CORRECT_DELAY)
            return
          }
          setActiveQuestion({ ...followUp, type: 'mcq', isDouble: false })
          setIsDoubleFollowUp(true)
          setPendingCategoryCompletion(activeCategoryId)
          setSelectedOption(null)
          setUserAnswer('')
          setFeedback(null)
        }, CORRECT_DELAY)
        return
      }

      // Correct answer (normal question or double follow-up) completes the category.
      advance(
        pendingCategoryCompletion || activeCategoryId,
        true,
        CORRECT_DELAY,
      )
    },
    [
      activeQuestion,
      activeCategoryId,
      advance,
      clearTimer,
      feedback,
      isDoubleFollowUp,
      pendingCategoryCompletion,
      userAnswer,
    ],
  )

  const handleOptionSelect = useCallback(
    (index) => {
      if (feedback) return
      setSelectedOption(index)
      handleSubmit(index)
    },
    [feedback, handleSubmit],
  )

  // ---- Screen transitions ---------------------------------------------------
  const chooseLanguage = (value) => {
    setLang(value)
    setScreen('difficulty')
  }

  const chooseDifficulty = (value) => {
    clearTimer()
    setDifficulty(value)
    setCurrentRound(0)
    setRemainingCategories([])
    setActiveCategoryId(null)
    setActiveQuestion(null)
    setCorrectAnswers(0)
    setIncorrectAnswers(0)
    setScreen('question')

    // Let the difficulty state flush before starting the round.
    setTimeout(() => startNewRound(value), 0)
  }

  const restart = () => {
    clearTimer()
    localStorage.removeItem('damejka-lang')
    setLang(null)
    setDifficulty(null)
    setCurrentRound(0)
    setRemainingCategories([])
    setActiveCategoryId(null)
    setActiveQuestion(null)
    setFeedback(null)
    setCorrectAnswers(0)
    setIncorrectAnswers(0)
    setScreen('language')
  }

  if (screen === 'language') {
    return <>
      <BackgroundCanvas />
      <LanguageScreen onSelect={chooseLanguage} />
    </>
  }

  if (screen === 'difficulty') {
    return (
      <>
        <BackgroundCanvas />
        <DifficultyScreen
          lang={lang}
          onBack={() => setScreen('language')}
          onSelect={chooseDifficulty}
        />
      </>
    )
  }

  if (screen === 'roundComplete') {
    return (
      <RoundComplete
        lang={lang}
        round={currentRound}
        correctAnswers={correctAnswers}
        incorrectAnswers={incorrectAnswers}
        onNextRound={() => startNewRound(difficulty)}
        onRestart={restart}
      />
    )
  }

  return (
    <>
      <BackgroundCanvas />
      <main className="shell">
      <GameHeader
        lang={lang}
        round={currentRound}
        remainingCategories={remainingCategories}
        onExit={restart}
        onInstall={handleInstall}
        canInstall={Boolean(installPrompt)}
        installed={installed}
      />

      <QuestionCard
        lang={lang}
        question={activeQuestion}
        category={category}
        isDoubleFollowUp={isDoubleFollowUp}
        selectedOption={selectedOption}
        userAnswer={userAnswer}
        scrambled={scrambled}
        feedback={feedback}
        onOptionSelect={handleOptionSelect}
        onAnswerChange={setUserAnswer}
        onSubmit={() => handleSubmit()}
      />
    </main>
    </>
  )
}