export default function QuestionOptions({
  question,
  selectedOption,
  feedback,
  onSelect,
}) {
  return (
    <div className="options" role="group" aria-label="Варыянты адказу">
      {question.options.map((option, index) => {
        const isCorrect = feedback && index === question.correctIndex
        const isIncorrect = feedback && selectedOption === index && !isCorrect

        return (
          <button
            key={`${option}-${index}`}
            className={`option ${selectedOption === index ? 'selected' : ''} ${isCorrect ? 'correct' : ''} ${isIncorrect ? 'incorrect' : ''}`}
            disabled={Boolean(feedback)}
            onClick={() => onSelect(index)}
            aria-pressed={selectedOption === index}
          >
            <b>{String.fromCharCode(65 + index)}</b>
            <span>{option}</span>
            {isCorrect && <em>✓</em>}
            {isIncorrect && <em>×</em>}
          </button>
        )
      })}
    </div>
  )
}
