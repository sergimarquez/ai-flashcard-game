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
    setLevel(1);
    setCorrectAnswers(0);
    setTokens(0);
    setQuestionNumber(1);
    setPreviousQuestions([]);
    setGameActive(true);
    Cookies.set('level', '1');
    Cookies.set('tokens', '0');
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
        if (level + 1 > highestLevel) setHighestLevel(level + 1);
        generateQuestion();
      } else {
        setQuestionNumber(questionNumber + 1);
        generateQuestion();
      }
    } else {
      alert(`❌ Wrong! The correct answer was: ${questionData.correctAnswer}
      
  💡 Explanation: ${questionData.explanation}`);
  
      setTimeout(() => {
        alert("🔄 Try Again! Restarting this level.");
        setQuestionNumber(1);
        setSelectedOption(null);
        generateQuestion();
      }, 1000);
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
    <div className="p-10">
      <h1 className="text-3xl font-bold">AI-Powered Flashcard Game</h1>

      {gameActive ? (
        <>
          <p className="font-semibold text-lg">Level: {level}</p>
          <p>Question {questionNumber}/3</p>
          {/* Token Display */}
          <div className="mt-4">
            <p className="font-semibold text-lg">Tokens: {tokens} 🎟️</p>
            <button
              className="mt-2 p-2 bg-yellow-500 text-black rounded"
              onClick={useTokenToRemoveWrongAnswer}
              disabled={tokens === 0}
            >
              🔥 Use Token (Remove Wrong Answer)
            </button>
          </div>


          {questionData && (
            <div className="mt-4 p-4 border rounded bg-gray-100 shadow">
              <p className="text-lg font-semibold">{questionData.question}</p>

              {/* Ensure options exist before mapping */}
              {questionData?.options && questionData.options.length >= 2 ? (
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
                    disabled={selectedOption !== null}
                  >
                    {option} {selectedOption && (option === questionData.correctAnswer ? '✅' : option === selectedOption ? '❌' : '')}
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
