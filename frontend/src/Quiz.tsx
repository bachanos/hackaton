import React, { useState } from 'react';
import { quizQuestions, Question } from './quizData';
import './Quiz.css';

const Quiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);

  const currentQuestion: Question = quizQuestions[currentQuestionIndex];
  const isCorrect = selectedAnswerId === currentQuestion.correctAnswerId;

  const handleAnswerClick = (answerId: number) => {
    if (showResult) return;
    setSelectedAnswerId(answerId);
    setShowResult(true);
    if (answerId === currentQuestion.correctAnswerId) {
      setCorrectAnswersCount((prevCount) => prevCount + 1);
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswerId(null);
    setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % quizQuestions.length);
  };

  return (
    <div className="quiz-container">
      <h2>Quiz Espacial</h2>
      <div className="progress-container">
        <div className="progress-bar-background">
          <div
            className="progress-bar-foreground"
            style={{ width: `${(correctAnswersCount / quizQuestions.length) * 100}%` }}
          ></div>
        </div>
        <span className="progress-text">
          Aciertos: {correctAnswersCount} de {quizQuestions.length}
        </span>
      </div>
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
