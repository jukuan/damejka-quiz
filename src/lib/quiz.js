export const DEFAULT_LANG = 'be'

export const pickRandom = (items) =>
  items[Math.floor(Math.random() * items.length)]

/**
 * Fisher–Yates shuffle with correctIndex remapping.
 * Non-MCQ questions pass through unchanged.
 */
export function shuffleOptions(question) {
  if (question.type !== 'mcq') return question
  if (!question.options || question.options.length < 2) return question

  const indices = question.options.map((_, i) => i)
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }

  return {
    ...question,
    options: indices.map((i) => question.options[i]),
    correctIndex: indices.indexOf(question.correctIndex),
  }
}

/**
 * Build a `getQuestionPack(lang)` function from the eager glob.
 * Falls back to DEFAULT_LANG if the requested language is missing.
 */
export function createQuestionPackGetter(questionModules) {
  // Build a lookup by language id, independent of the glob's relative prefix.
  // Matches both './data/be/questions.js' and '../data/be/questions.js'.
  const byLang = {}
  for (const [path, mod] of Object.entries(questionModules)) {
    const match = path.match(/\/([^/]+)\/questions\.js$/)
    if (match) byLang[match[1]] = mod
  }

  return function getQuestionPack(lang) {
    const mod = byLang[lang] || byLang[DEFAULT_LANG]

    if (!mod) {
      return { categories: [], questions: [], scrambleWord: (w) => w }
    }

    return {
      categories: mod.categories || [],
      questions: mod.questions || [],
      scrambleWord: mod.scrambleWord || ((w) => w),
    }
  }
}
