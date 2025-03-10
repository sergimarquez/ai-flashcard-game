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
  const [selectedOption, setSelectedOption] = useState(null)
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([])
  const [tokens, setTokens] = useState(Number(Cookies.get('tokens')) || 0)
  const [lives, setLives] = useState(0); // New state for tracking lives

  useEffect(() => {
    Cookies.set('level', String(level))
    Cookies.set('highestLevel', String(highestLevel))
    Cookies.set('tokens', String(tokens))
  }, [level, highestLevel, tokens])

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
    setLevel(1); // Start at level 1
    setCorrectAnswers(0);
    setTokens(0);
    setQuestionNumber(1);
    setLives(0); // Reset lives
    setPreviousQuestions([]);
    setGameActive(true);
    Cookies.set('level', '1');
    Cookies.set('tokens', '0');
    Cookies.set('lives', '0');
    generateQuestion();
  };

  const handleAnswer = (selectedOption) => {
    setSelectedOption(selectedOption);

    if (selectedOption === questionData.correctAnswer) {
      alert('✅ Correct!');

      if (questionNumber === 3) {
        alert(`🎉 Level ${level} Completed! Moving to Level ${level + 1}`);
        setLevel(level + 1);
        setTokens(tokens + 1);
        setQuestionNumber(1);

        // Grant an extra life every 3 levels completed
        if (level % 3 === 0) {
          setLives(lives + 1);
          alert('🎉 You earned an extra life!');
        }

        if (level + 1 > highestLevel) setHighestLevel(level + 1);
        generateQuestion();
      } else {
        setQuestionNumber(questionNumber + 1);
        generateQuestion();
      }
    } else {
      alert(`❌ Wrong! The correct answer was: ${questionData.correctAnswer}`);
      
      // If player still has lives left, allow them to continue
      if (lives > 0) {
        alert(`You have ${lives} lives left. Try again!`);
        setLives(lives - 1); // Deduct one life
        setSelectedOption(null); // Reset selected option
        setQuestionNumber(1); // Restart current level
        generateQuestion(); // Generate a new question
      } else {
        alert("❌ No lives left! Restarting the game.");
        setGameActive(false);
        setLevel(0); // Reset to level 0 on failure
      }
    }
  };

  const useTokenToRemoveWrongAnswer = () => {
    if (tokens > 0 && questionData && questionData.options.length > 2) {
      const wrongAnswers = questionData.options.filter(option => option !== questionData.correctAnswer);

      if (wrongAnswers.length > 0) {
        const answerToRemove = wrongAnswers[Math.floor(Math.random() * wrongAnswers.length)];

        // ✅ Correctly update the state to remove the selected wrong answer
        setQuestionData(prevData => {
          if (!prevData) return null; // Prevent errors if questionData is null
          return {
            ...prevData,
            options: prevData.options.filter(option => option !== answerToRemove),
          };
        });

        setTokens(prevTokens => prevTokens - 1); // ✅ Deduct one token
      }
    } else {
      alert("❌ No tokens left or can't remove more answers!");
    }
  };

  return (
    <div className="p-10 max-w-screen-sm mx-auto bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">AI-Powered Flashcard Game</h1>

      {/* Instructions */}
      {!gameActive && (
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-semibold">Welcome to the Flashcard Game!</h2>
          <p>Select your topics, start the game, and answer questions to level up!</p>
          <p className="mt-2">You can use tokens to remove incorrect answers. Try to get to the highest level possible!</p>
          <p className="mt-4 text-lg font-semibold">Good luck! 🎮</p>
        </div>
      )}

      {gameActive ? (
        <>
          <div className="mb-6 flex justify-between items-center">
            <p className="font-semibold text-lg">Level: {level}</p>
            <p className="font-semibold text-lg">Lives: {lives} ❤️</p>
            <p className="font-semibold text-lg">Tokens: {tokens} 🎟️</p>
          </div>

          <p className="text-center mb-4">Question {questionNumber}/3</p>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setGameActive(false)}
              className="w-full sm:w-auto p-3 bg-red-500 text-white rounded text-lg font-semibold hover:bg-red-600 transition"
            >
              🚪 Quit Game
            </button>
          </div>

          {/* Question and Options */}
          <div className="mt-8 p-4 border rounded bg-gray-100 shadow">
            {questionData ? (
              <>
                <p className="text-lg font-semibold">{questionData.question}</p>
                {questionData?.options && questionData.options.length >= 2 ? (
                  questionData.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full p-3 mt-2 rounded transition ${
                        selectedOption
                          ? option === questionData.correctAnswer
                            ? 'bg-green-500 text-white' // Correct answer is green
                            : option === selectedOption
                            ? 'bg-red-500 text-white' // Wrong answer is red
                            : 'bg-gray-200'
                          : 'bg-gray-200 hover:bg-blue-500 hover:text-white'
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <p className="text-red-500">⚠️ Error: Question options are missing!</p>
                )}
              </>
            ) : (
              <p>Loading question...</p>
            )}
          </div>
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

          {/* Start Game Button */}
          <div className="mt-6">
            <button
              className="w-full p-3 bg-green-500 text-white rounded text-lg font-semibold hover:bg-green-600 transition"
              onClick={startGame}
              disabled={selectedTopics.length === 0}
            >
              🎮 Start Game
            </button>
          </div>
        </>
      )}
    </div>
  )
}
