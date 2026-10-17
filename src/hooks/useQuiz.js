import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { trackEvent } from '../analytics'
import {
  DEFAULT_LANG,
  createQuestionPackGetter,
  pickRandom,
  shuffleOptions,
} from '../lib/quiz'

const CORRECT_DELAY = 1000
const WRONG_DELAY = 1500

const questionModules = import.meta.glob('../data/*/questions.js', {
  eager: true,
})
const getQuestionPack = createQuestionPackGetter(questionModules)

export function useQuiz({ lang }) {
  const [difficulty, setDifficulty] = useState(null)
  const [phase, setPhase] = useState('idle') // 'idle' | 'playing' | 'roundComplete'
  const [currentRound, setCurrentRound] = useState(0)
  const [remainingCategories, setRemainingCategories] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [activeQuestion, setActiveQuestion] = useState(null)
  const [isDoubleFollowUp, setIsDoubleFollowUp] = useState(false)
  const [pendingCategoryCompletion, setPendingCategoryCompletion] =
    useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [scrambled, setScrambled] = useState('')
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)
  const timer = useRef(null)

  const { categories, questions, scrambleWord } = useMemo(
    () => getQuestionPack(lang || DEFAULT_LANG),
    [lang],
  )

  const getPool = useCallback(
    (categoryId, difficultyValue) =>
      questions.filter(
        (q) => q.category === categoryId && q.difficulty === difficultyValue,
      ),
    [questions],
  )

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const category = useMemo(
    () => categories.find((c) => c.id === activeCategoryId) ?? null,
    [categories, activeCategoryId],
  )

  const loadQuestion = useCallback(
    (categoryId, difficultyValue, questionOverride = null) => {
      const pool = getPool(categoryId, difficultyValue)
      if (!pool.length) return false

      const question = shuffleOptions(questionOverride || pickRandom(pool))

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
      return true
    },
    [getPool, scrambleWord],
  )

  const beginRound = useCallback(
    (difficultyValue, roundNumber) => {
      const availableCategories = categories
        .filter((c) => getPool(c.id, difficultyValue).length > 0)
        .map((c) => c.id)

      if (!availableCategories.length) {
        console.warn(
          `No questions for lang=${lang}, difficulty=${difficultyValue}`,
        )
        return false
      }

      setDifficulty(difficultyValue)
      setCurrentRound(roundNumber)
      setRemainingCategories(availableCategories)
      setCorrectAnswers(0)
      setIncorrectAnswers(0)
      setPhase('playing')
      loadQuestion(pickRandom(availableCategories), difficultyValue)
      return true
    },
    [categories, getPool, lang, loadQuestion],
  )

  const startFirstRound = useCallback(
    (difficultyValue) => {
      trackEvent('difficulty_selected', { difficulty: difficultyValue })
      return beginRound(difficultyValue, 1)
    },
    [beginRound],
  )

  const nextRound = useCallback(
    () => beginRound(difficulty, currentRound + 1),
    [beginRound, difficulty, currentRound],
  )

  const finishRound = useCallback(() => {
    clearTimer()
    setActiveQuestion(null)
    setActiveCategoryId(null)
    setPhase('roundComplete')
  }, [clearTimer])

  const advance = useCallback(
    (categoryId, completed, delay) => {
      clearTimer()
      const nextCategories = completed
        ? remainingCategories.filter((id) => id !== categoryId)
        : remainingCategories
      setRemainingCategories(nextCategories)
      const candidates = nextCategories.filter((id) => id !== categoryId)
      timer.current = setTimeout(() => {
        if (!candidates.length) {
          finishRound()
          return
        }
        loadQuestion(pickRandom(candidates), difficulty)
      }, delay)
    },
    [clearTimer, difficulty, finishRound, loadQuestion, remainingCategories],
  )

  const submit = useCallback(
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

      trackEvent('question_answered', {
        category: activeCategoryId,
        correct: isCorrect,
        is_double: activeQuestion.isDouble && !isDoubleFollowUp,
      })

      setFeedback({ correct: isCorrect, correctAnswer })
      if (isCorrect) {
        setCorrectAnswers((c) => c + 1)
      } else {
        setIncorrectAnswers((c) => c + 1)
      }

      if (!isCorrect) {
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
          setActiveQuestion(
            shuffleOptions({ ...followUp, type: 'mcq', isDouble: false }),
          )
          setIsDoubleFollowUp(true)
          setPendingCategoryCompletion(activeCategoryId)
          setSelectedOption(null)
          setUserAnswer('')
          setFeedback(null)
        }, CORRECT_DELAY)
        return
      }

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

  const selectOption = useCallback(
    (index) => {
      if (feedback) return
      setSelectedOption(index)
      submit(index)
    },
    [feedback, submit],
  )

  const reset = useCallback(() => {
    clearTimer()
    setPhase('idle')
    setDifficulty(null)
    setCurrentRound(0)
    setRemainingCategories([])
    setActiveCategoryId(null)
    setActiveQuestion(null)
    setFeedback(null)
    setSelectedOption(null)
    setUserAnswer('')
    setScrambled('')
    setCorrectAnswers(0)
    setIncorrectAnswers(0)
    setIsDoubleFollowUp(false)
    setPendingCategoryCompletion(null)
  }, [clearTimer])

  return {
    // State
    phase,
    difficulty,
    currentRound,
    remainingCategories,
    category,
    question: activeQuestion,
    isDoubleFollowUp,
    selectedOption,
    userAnswer,
    feedback,
    scrambled,
    correctAnswers,
    incorrectAnswers,
    // Actions
    startFirstRound,
    nextRound,
    submit,
    selectOption,
    setUserAnswer,
    reset,
  }
}
