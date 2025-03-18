import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import Question from './Question';
import { fakeData } from '../data/fakeQuestions'

const Game = () => {
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameActive, setGameActive] = useState(false);
  const [level, setLevel] = useState(Number(Cookies.get('level')) || 1);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [lives, setLives] = useState(1);
  const [modalMessage, setModalMessage] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);

  useEffect(() => {
    Cookies.set('level', String(level));
  }, [level]);

  const startGame = () => {
    setGameActive(true);
    setLevel(1);
    setLives(1);
    setQuestionNumber(1);
    generateQuestion();
  };

  const generateQuestion = () => {
    setQuestionData(fakeData[Math.floor(Math.random() * fakeData.length)]);
  };

  const handleAnswer = (option) => {
    setSelectedOption(option);
    if (option === questionData.correctAnswer) {
      setFeedbackMessage('✅ Correct!');
      setShowNextButton(true);
    } else {
      setFeedbackMessage(`❌ Wrong! The correct answer was: ${questionData.correctAnswer}`);
      setShowNextButton(true);
    }
  };

  const nextQuestion = () => {
    setShowNextButton(false);
    setFeedbackMessage(null);
    generateQuestion();
  };

  return (
    <div className="p-10 bg-black text-green-400 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-6 text-center text-white pixel-font">🕹️ CodeQuest: Frontend Challenges 🎮</h1>


      {gameActive ? (
        <>
          <div className="mb-6 flex justify-between items-center w-full max-w-lg">
            <div className="bg-green-800 p-3 rounded-md text-center w-full border-4 border-green-400">
              <p className="text-lg text-white pixel-font">Level: {level}</p>
              <p className="text-lg text-white pixel-font">Lives: {lives} ❤️</p>
            </div>
          </div>

          <Question questionData={questionData} selectedOption={selectedOption} handleAnswer={handleAnswer} />

          {feedbackMessage && (
            <div className="mt-4 text-center text-lg font-semibold text-white pixel-font">
              <p>{feedbackMessage}</p>
              {showNextButton && (
                <button className="mt-4 p-3 bg-blue-500 text-white rounded pixel-button" onClick={nextQuestion}>
                  Next Question
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <button onClick={startGame} className="p-4 pixel-button">Start Game</button>
      )}
    </div>
  );
};

export default Game;
