import React, { useState } from 'react';
import { quizQuestions, Question } from './quizData';
import './Quiz.css';

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion: Question = quizQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswerId === currentQuestion.correctAnswerId;

  const handleAnswerClick = (answerId: number) => {
    if (showResult) return;
    setSelectedAnswerId(answerId);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswerId(null);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % quizQuestions.length);
  };

  return (
    <div className="quiz-container">
      <h2>Quiz Espacial</h2>
      <div className="question-container">
        <h3>{currentQuestion.questionText}</h3>
        <div className="answers-grid">
          {currentQuestion.answers.map((answer) => (
            <div
              key={answer.id}
              className={`answer-card ${selectedAnswerId === answer.id ? (isCorrect ? 'correct' : 'incorrect') : ''}`}
              onClick={() => handleAnswerClick(answer.id)}
            >
              <img src={answer.imageUrl} alt={answer.text} />
              <p>{answer.text}</p>
            </div>
          ))}
        </div>
      </div>
      {showResult && (
        <div className="result-container">
          <h4>{isCorrect ? '¡Correcto!' : 'Incorrecto'}</h4>
          <p>{currentQuestion.explanation}</p>
          <button onClick={handleNextQuestion}>Siguiente Pregunta</button>
        </div>
      )}
    </div>
  );
};

export default Quiz;
