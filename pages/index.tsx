import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { FaGithub } from 'react-icons/fa'

const Modal = ({ message, onClose }) => (
  <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-70 z-50">
    <div className="bg-gray-900 p-6 rounded-lg shadow-lg max-w-md w-full">
      <p className="text-lg font-semibold text-yellow-300">{message}</p>
      <div className="mt-4 flex justify-end">
        <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Close
        </button>
      </div>
    </div>
  </div>
);

const fakeData = [
  {
    question: "What is the correct way to define a function in JavaScript?",
    options: ["function myFunc()", "function = myFunc()", "myFunc() = function"],
    correctAnswer: "function myFunc()",
    explanation: "In JavaScript, the correct way to define a function is using the 'function' keyword followed by the function name."
  },
  {
    question: "Which of these is a JavaScript framework?",
    options: ["React", "Vue", "Angular", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "React, Vue, and Angular are all popular JavaScript frameworks."
  },
  {
    question: "What does CSS stand for?",
    options: ["Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
    correctAnswer: "Cascading Style Sheets",
    explanation: "CSS stands for Cascading Style Sheets, which is used for styling HTML elements."
  },
];



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
  const [lives, setLives] = useState(1); // Start with 1 life
  const [modalMessage, setModalMessage] = useState(null); // State for modal message
  const [showNextButton, setShowNextButton] = useState(false); // State for Next Question button visibility
  const [showRestartButton, setShowRestartButton] = useState(false); // State for Restart Game button visibility
  const [feedbackMessage, setFeedbackMessage] = useState(null); // For feedback on the answers

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

  // const generateQuestion = async () => {
  //   setLoading(true)
  //   setQuestionData(null)
  //   setSelectedOption(null) // ✅ Reset selected option

  //   try {
  //     const response = await fetch('/api/generateQuestion', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ topics: selectedTopics, level, previousQuestions }),
  //     })

  //     const data = await response.json()
  //     if (data.error) throw new Error(data.error)

  //     setQuestionData(data)
  //     setPreviousQuestions(prev => [...prev, data.question]) // Store past questions
  //   } catch (error) {
  //     alert(`Error: ${error.message}`)
  //   }

  //   setLoading(false)
  // }

  const generateQuestion = () => {
    setLoading(true);
    setQuestionData(null);
    setSelectedOption(null); // ✅ Reset selected option
  
    // Simulate API delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fakeData.length);
      const randomQuestion = fakeData[randomIndex];
      setQuestionData(randomQuestion); // Set question data
      setPreviousQuestions((prev) => [...prev, randomQuestion.question]); // Store past questions
      setLoading(false); // Stop loading spinner
    }, 500); // Simulate network delay
  };
  

  const startGame = () => {
    setLevel(1); // Start at level 1
    setCorrectAnswers(0);
    setQuestionNumber(1);
    setLives(1); // Start with 1 life
    setPreviousQuestions([]);
    setGameActive(true);
    setShowRestartButton(false); // Hide Restart button on game start
    generateQuestion();
  };

  const handleAnswer = (selectedOption) => {
    setSelectedOption(selectedOption);
  
    if (selectedOption === questionData.correctAnswer) {
      // Correct answer logic
      let message = '✅ Correct!';
  
      if (questionNumber === 3) {
        // End of level: advance to next level and reset question counter
        message = `🎉 Level ${level} Completed! Moving to Level ${level + 1}`;
        setLevel(level + 1);
        setQuestionNumber(1);
  

          setLives((prevLives) => prevLives + 1);
          message += ' 🎉 You earned an extra life!';

  
        if (level + 1 > highestLevel) {
          setHighestLevel(level + 1);
        }
      } else {
        setQuestionNumber(questionNumber + 1);
      }
  
      setFeedbackMessage(message);
      setShowNextButton(true);
    } else {
      // Wrong answer logic
      let message = `❌ Wrong! The correct answer was: ${questionData.correctAnswer}.`;
      message += ` Explanation: ${questionData.explanation || 'No explanation available'}`;
  
      if (lives > 1) {
        // Deduct a life if more than 1 is available
        setLives(lives - 1);
        message += ' You lost a life.';
        setFeedbackMessage(message);
        setShowNextButton(true);
      } else {
        // Game over when no lives remain
        setLives(0);
        message += ' No lives left! Game Over.';
        setFeedbackMessage(message);
        setShowRestartButton(true);
      }
    }
  };  
  
  
  const nextQuestion = () => {
    // If player still has lives left, continue the game
    if (lives > 0) {
      setShowNextButton(false); // Hide the next question button
      setFeedbackMessage(null); // Clear feedback message
      generateQuestion(); // Load the next question
    }
  };
  
  const restartGame = () => {
    setLevel(1); // Reset to level 1
    setCorrectAnswers(0);
    setQuestionNumber(1);
    setLives(1); // Start with 1 life
    setPreviousQuestions([]);
    setGameActive(true);
    setShowRestartButton(false); // Hide restart button
    setFeedbackMessage(null); // Clear feedback message
    generateQuestion(); // Start new game
  };
  

  return (
    <div className="p-10 bg-gray-900 text-gray-100 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-yellow-400">⚔️ CodeQuest: Frontend Challenges 🏆</h1>

      {/* Modal */}
      {modalMessage && <Modal message={modalMessage} onClose={() => setModalMessage(null)} />}

      {/* Instructions */}
      {!gameActive && (
        <div className="mb-6 text-center text-gray-300">
          <h2 className="text-2xl font-semibold text-white">How to Play</h2>
          <p className="text-white">Select your topics and start the game. Answer coding questions to level up!</p>
          <p className="mt-2 text-white">Earn a **token** after completing each level and an **extra life** every 3 levels.</p>
          <p className="mt-4 text-lg font-semibold text-white">Good luck and have fun! 🎮</p>
        </div>
      )}

      {gameActive ? (
        <>
          <div className="mb-6 flex justify-between items-center w-full max-w-lg">
            <div className="bg-blue-800 p-3 rounded-md text-center w-full">
              <p className="text-lg text-yellow-300">Level: {level}</p>
              <p className="text-lg text-yellow-300">Lives: {lives} ❤️</p>
            </div>
          </div>

          <p className="text-center mb-4 text-gray-300">Question {questionNumber}/3</p>

          <div className="mt-4 w-full bg-gray-600 rounded-lg h-2 max-w-lg">
            <div className="bg-blue-500 h-full" style={{ width: `${(questionNumber / 3) * 100}%` }} />
          </div>

          {/* Question and Options */}
          <div className="mt-8 p-6 border rounded bg-white shadow-md w-full max-w-lg">
            {questionData ? (
              <>
                <p className="text-lg font-semibold text-gray-800">{questionData.question}</p>
                {questionData?.options && questionData.options.length >= 2 ? (
                  questionData.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full p-3 mt-2 text-black rounded transition ${
                        selectedOption
                          ? option === questionData.correctAnswer
                            ? 'bg-green-500 text-white'
                            : option === selectedOption
                            ? 'bg-red-500 text-white'
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
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            )}

            {/* Feedback message */}
            {feedbackMessage && (
              <div className="mt-4 text-center text-lg font-semibold text-gray-800">
                <p>{feedbackMessage}</p>
                {showNextButton && (
                  <button 
                    className="mt-4 p-3 bg-blue-500 text-white rounded"
                    onClick={nextQuestion}
                  >
                    Next Question
                  </button>
                )}
              </div>
            )}

            {/* Restart Game Button */}
            {showRestartButton && (
              <div className="mt-4 text-center">
                <button 
                  className="p-3 bg-green-500 text-white rounded"
                  onClick={restartGame}
                >
                  Restart Game
                </button>
              </div>
            )}

          </div>
        </>
      ) : (
        <>
          {/* Topic Selection UI */}
          <div className="mt-4 text-center">
            <p className="font-semibold text-gray-800 text-white">Select Topics:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {allTopics.map(topic => (
                <button
                  key={topic}
                  className={`p-2 rounded border transition ${
                    selectedTopics.includes(topic)
                      ? 'bg-blue-500 text-white border-blue-700'
                      : 'bg-gray-200 text-black border-gray-400'
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
              Start Game
            </button>
          </div>
        </>
      )}

      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-4 bg-gray-800 text-white text-center">
        <p>Created by <a href="https://sergimarquez.com" className="text-blue-400">SergiMarquez</a> | <a href="https://github.com/sergimarquez" target="_blank" rel="noopener noreferrer"><FaGithub className="inline text-lg" /></a></p>
      </footer>
    </div>
  )
}
