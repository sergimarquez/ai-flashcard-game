import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import { FaGithub } from 'react-icons/fa'

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

// Original generateQuestion function
// const generateQuestion = async () => {
//   setLoading(true);
//   setQuestionData(null);
//   setSelectedOption(null); // ✅ Reset selected option

//   try {
//     const response = await fetch('/api/generateQuestion', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ topics: selectedTopics, level, previousQuestions }),
//     });

//     const data = await response.json();
//     if (data.error) throw new Error(data.error);

//     setQuestionData(data);
//     setPreviousQuestions((prev) => [...prev, data.question]); // Store past questions
//   } catch (error) {
//     alert(`Error: ${error.message}`);
//   }

//   setLoading(false);
// };

// Commented-out simulated version of generateQuestion
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
    setLevel(1);
    setCorrectAnswers(0);
    setQuestionNumber(1);
    setLives(1); 
    setPreviousQuestions([]);
    setGameActive(true);
    setShowRestartButton(false);
    generateQuestion();
  };

  const handleAnswer = (selectedOption) => {
    setSelectedOption(selectedOption);
  
    if (selectedOption === questionData.correctAnswer) {
      let message = '✅ Correct!';
  
      if (questionNumber === 3) {
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
      let message = `❌ Wrong!`;
      message += ` Explanation: ${questionData.explanation || 'No explanation available'}`;
  
      if (lives > 1) {
        setLives(lives - 1);
        message += ' You lost a life.';
        setFeedbackMessage(message);
        setShowNextButton(true);
      } else {
        setLives(0);
        message += ' No lives left! Game Over.';
        setFeedbackMessage(message);
        setShowRestartButton(true);
      }
    }
  };  
  
  
  const nextQuestion = () => {
    if (lives > 0) {
      setShowNextButton(false);
      setFeedbackMessage(null);
      generateQuestion();
    }
  };
  
  const restartGame = () => {
    setLevel(1);
    setCorrectAnswers(0);
    setQuestionNumber(1);
    setLives(1);
    setPreviousQuestions([]);
    setGameActive(true);
    setShowRestartButton(false);
    setFeedbackMessage(null);
    generateQuestion();
  };
  

  return (
    <div className="p-10 bg-black text-green-400 min-h-screen flex flex-col justify-center items-center retro-container">
      <h1 className="text-4xl font-bold mb-6 text-center text-white  pixel-font">
        🕹️ CodeQuest: Frontend Challenges 🎮
      </h1>
  
      {/* Instructions */}
      {!gameActive && (
        <div className="mb-6 text-center text-white pixel-font">
          <h2 className="text-2xl ">How to Play</h2>
          <p>Select your topics and start the game. Answer coding questions to level up!</p>
          <p className="mt-2">Earn an extra life every 3 questions.</p>
          <p className="mt-4 text-lg ">Good luck and have fun! 🎮</p>
        </div>
      )}
  
      {gameActive ? (
        <>
          <div className="mb-6 flex justify-between items-center w-full max-w-lg glow">
            <div className="bg-green-800 p-3 rounded-md text-center w-full border-4 border-green-400">
              <p className="text-lg text-white pixel-font">Level: {level}</p>
              <p className="text-lg text-white pixel-font">Lives: {lives} ❤️</p>
            </div>
          </div>
  
          <p className="text-center mb-4 text-green-300 pixel-font">
            Question {questionNumber}/3
          </p>
  
          {/* Retro Progress Bar */}
          <div className="mt-4 w-full bg-gray-600 rounded-lg h-2 max-w-lg border-2 border-green-400 glow">
            <div
              className="bg-green-500 h-full"
              style={{ width: `${(questionNumber / 3) * 100}%` }}
            />
          </div>
  
          {/* Question and Options */}
          <div className="mt-8 p-6 border-4 border-green-400 rounded bg-gray-800 shadow-md w-full max-w-lg">
            {questionData ? (
              <>
                <p className="text-lg font-bold text-center text-white pixel-font">
                  {questionData.question}
                </p>
                {questionData?.options && questionData.options.length >= 2 ? (
                  questionData.options.map((option, index) => (
                    <button
                      key={index}
                      className={`w-full p-3 mt-2 rounded shadow-md pixel-button ${
                        selectedOption
                          ? option === questionData.correctAnswer
                            ? 'bg-green-500'
                            : option === selectedOption
                            ? 'bg-red-500'
                            : 'bg-gray-200'
                          : 'hover:bg-blue-70 bg-yellow-300'
                      }`}
                      onClick={() => handleAnswer(option)}
                      disabled={selectedOption !== null}
                    >
                      {option}
                    </button>
                  ))
                ) : (
                  <p className="text-red-500 pixel-font">
                    ⚠️ Error: Question options are missing!
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
              </div>
            )}
  
            {/* Feedback message */}
            {feedbackMessage && (
              <div className="mt-4 text-center text-lg font-semibold text-green-300 pixel-font">
                <p>{feedbackMessage}</p>
                {showNextButton && (
                  <button className="mt-4 p-3 bg-blue-500 text-white rounded pixel-button" onClick={nextQuestion}>
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
            <p className="font-semibold text-white pixel-font">Select Topics:</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {allTopics.map(topic => (
                <button
                  key={topic}
                  className={`p-2 rounded border-2 pixel-button ${
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
              className="w-full p-3 bg-green-500 text-white rounded text-lg font-semibold hover:bg-green-600 transition pixel-button"
              onClick={startGame}
              disabled={selectedTopics.length === 0}
            >
              Start Game
            </button>
          </div>
        </>
      )}
  
      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-4 bg-gray-800 text-white text-center pixel-font">
        <p>
          Created by <a href="https://sergimarquez.com" target="_blank" className="text-blue-400">SergiMarquez</a> |
          <a href="https://github.com/sergimarquez/ai-flashcard-game" target="_blank" rel="noopener noreferrer">
            <FaGithub className="inline text-lg" />
          </a> | v.1.0
        </p>
      </footer>
    </div>
  );  
}
