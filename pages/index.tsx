import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export default function Home() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['HTML'])
  const [questionData, setQuestionData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [level, setLevel] = useState(Number(Cookies.get('level')) || 0)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [highestLevel, setHighestLevel] = useState(Number(Cookies.get('highestLevel')) || 0)
  const [gameActive, setGameActive] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null) // ✅ Added selectedOption state
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])

  useEffect(() => {
    Cookies.set('level', String(level))
    Cookies.set('highestLevel', String(highestLevel))
  }, [level, highestLevel])

  const allTopics = ['HTML', 'CSS', 'JavaScript', 'React']

  const toggleTopic = (topic: string) => {
    setSelectedTopics(prev =>
      prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]
    )
  }

  const generateQuestion = async () => {
    setLoading(true)
    setQuestionData(null)
    setSelectedOption(null) // ✅ Reset selected option

    try {
      const response = await fetch('/api/generateQuestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: selectedTopics, level, previousQuestions }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setQuestionData(data)
      setPreviousQuestions(prev => [...prev, data.question]) // Store past questions
    } catch (error) {
      alert(`Error: ${error.message}`)
    }

    setLoading(false)
  }

  const startGame = () => {
    setCorrectAnswers(0)
    setQuestionNumber(1)
    setPreviousQuestions([]) // Reset past questions on new game
    setGameActive(true)
    generateQuestion()
  }

  const handleAnswer = (selectedOption) => {
    setSelectedOption(selectedOption) // ✅ Store user choice

    if (selectedOption === questionData.correctAnswer) {
      alert('✅ Correct!')

      if (questionNumber === 3) {
        alert(`🎉 Level ${level} Completed! Moving to Level ${level + 1}`)
        setLevel(level + 1)
        setQuestionNumber(1)
        if (level + 1 > highestLevel) setHighestLevel(level + 1)
      } else {
        setQuestionNumber(questionNumber + 1)
        generateQuestion()
      }
    } else {
      alert(`❌ Wrong! The correct answer was: ${questionData.correctAnswer}`)
      setGameActive(false)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">AI-Powered Flashcard Game</h1>

      {gameActive ? (
        <>
          <p className="font-semibold text-lg">Level: {level}</p>
          <p>Question {questionNumber}/3</p>

          {questionData && (
            <div className="mt-4 p-4 border rounded bg-gray-100 shadow">
              <p className="text-lg font-semibold">{questionData.question}</p>

              {/* Ensure options exist before mapping */}
              {questionData?.options && questionData.options.length === 4 ? (
                questionData.options.map((option, index) => (
                  <button
                    key={index}
                    className={`block w-full p-3 mt-2 rounded transition ${
                      selectedOption
                        ? option === questionData.correctAnswer
                          ? 'bg-green-500 text-white' // ✅ Correct answer is green
                          : option === selectedOption
                          ? 'bg-red-500 text-white' // ❌ Wrong answer is red
                          : 'bg-gray-200'
                        : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                    }`}
                    onClick={() => handleAnswer(option)}
                    disabled={selectedOption !== null} // ✅ Disable buttons after selecting
                  >
                    {option}
                  </button>
                ))
              ) : (
                <p className="text-red-500">⚠️ Error: Question options are missing!</p>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Topic Selection UI */}
          <div className="mt-4">
            <p className="font-semibold">Select Topics:</p>
            <div className="flex flex-wrap gap-2">
              {allTopics.map(topic => (
                <button
                  key={topic}
                  className={`p-2 rounded border transition ${
                    selectedTopics.includes(topic) 
                      ? 'bg-blue-500 text-white border-blue-700' 
                      : 'bg-gray-200 border-gray-400'
                  }`}
                  onClick={() => toggleTopic(topic)}
                >
                  {selectedTopics.includes(topic) ? `✅ ${topic}` : topic}
                </button>
              ))}
            </div>
          </div>

          {/* Start Game Button (Always Visible) */}
          <div className="mt-6">
            <button
              className="w-full p-3 bg-green-500 text-white rounded text-lg font-semibold hover:bg-green-600 transition"
              onClick={startGame}
              disabled={selectedTopics.length === 0} // Disable if no topics are selected
            >
              🎮 Start Game
            </button>
          </div>
        </>
      )}
    </div>
  )
}
