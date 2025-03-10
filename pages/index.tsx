import { useState } from 'react'

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['HTML'])
  const [questionData, setQuestionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState(1)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [passCount, setPassCount] = useState(0)
  const [highestLevel, setHighestLevel] = useState(1)
  const [showAnswer, setShowAnswer] = useState(false)

  const allTopics = ['HTML', 'CSS', 'JavaScript', 'React']

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  const generateQuestion = async () => {
    if (correctAnswers >= 5) {
      alert(`Level ${level} completed! Moving to Level ${level + 1}`)
      setLevel(level + 1)
      setCorrectAnswers(0)
      setPassCount(passCount + 1) // Earn a Pass Question comodin

      if (level + 1 > highestLevel) {
        setHighestLevel(level + 1)
      }
    }

    setShowAnswer(false)
    setQuestionData(null)
    setLoading(true)

    const response = await fetch('/api/generateQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topics: selectedTopics }),
    })

    const data = await response.json()
    setQuestionData(data)
    setLoading(false)
  }

  const handleAnswer = (correct: boolean) => {
    if (correct) {
      setCorrectAnswers(correctAnswers + 1)
    } else {
      alert(`Wrong answer! Try again.`)
      setCorrectAnswers(0) // Restart progress on wrong answer
    }
    generateQuestion()
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">AI-Powered Flashcard Game</h1>

      {/* Level & Progress Display */}
      <div className="mt-4">
        <p className="font-semibold text-lg">Level: {level}</p>
        <p className="text-green-500">Highest Level Achieved: {highestLevel}</p>
        <p className="text-gray-500">Pass Question Comodins: {passCount}</p>
      </div>

      {/* Topic Selection */}
      <div className="mt-4">
        <p className="font-semibold">Select Topics:</p>
        <div className="flex flex-wrap gap-2">
          {allTopics.map(topic => (
            <button
              key={topic}
              className={`p-2 rounded border ${
                selectedTopics.includes(topic) ? 'bg-blue-500 text-white border-blue-700' : 'bg-gray-200 border-gray-400'
              }`}
              onClick={() => toggleTopic(topic)}
            >
              {selectedTopics.includes(topic) ? `✅ ${topic}` : topic}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Topics Display */}
      <div className="mt-4">
        <p className="font-semibold">Selected Topics:</p>
        <p className="text-blue-600">
          {selectedTopics.length > 0 ? selectedTopics.join(', ') : 'None'}
        </p>
      </div>

      {/* Generate Question Button */}
      <button
        className="mt-4 p-2 bg-green-500 text-white rounded"
        onClick={generateQuestion}
        disabled={loading || selectedTopics.length === 0}
      >
        {loading ? 'Generating...' : 'Generate Question'}
      </button>

      {/* Question Display */}
      {questionData && (
        <div className="mt-4 p-4 border rounded">
          <p className="text-lg font-semibold">{questionData.question}</p>

          {/* Show Answer */}
          {showAnswer ? (
            <>
              <p className="text-gray-500">Answer: {questionData.answer}</p>
              <p className="text-sm text-blue-400">{questionData.funFact}</p>

              {/* Answer Buttons */}
              <div className="mt-2">
                <button
                  className="p-2 bg-green-500 text-white rounded"
                  onClick={() => handleAnswer(true)}
                >
                  I Got It Right ✅
                </button>
                <button
                  className="ml-4 p-2 bg-red-500 text-white rounded"
                  onClick={() => handleAnswer(false)}
                >
                  I Got It Wrong ❌
                </button>
              </div>
            </>
          ) : (
            <button
              className="mt-2 p-2 bg-blue-500 text-white rounded"
              onClick={() => setShowAnswer(true)}
            >
              Show Answer
            </button>
          )}

          {/* Pass Question Button */}
          <button
            className="mt-2 ml-4 p-2 bg-yellow-500 text-black rounded"
            onClick={generateQuestion}
            disabled={passCount <= 0}
          >
            Pass Question ({passCount} left)
          </button>
        </div>
      )}
    </div>
  )
}
