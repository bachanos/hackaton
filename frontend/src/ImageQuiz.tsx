import React, { useState } from 'react';
import { imageQuizQuestions } from './quizData';
import './ImageQuiz.css';

const ImageQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentQuestion = imageQuizQuestions[currentQuestionIndex];

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return; // Evitar cambiar la respuesta

    const correct = answerIndex === currentQuestion.correctAnswer;
    setSelectedAnswer(answerIndex);
    setIsCorrect(correct);

    setTimeout(() => {
      // Avanzar a la siguiente pregunta
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex((prevIndex) => (prevIndex + 1) % imageQuizQuestions.length);
    }, 2000); // Esperar 2 segundos antes de pasar a la siguiente
  };

  return (
    <div className="image-quiz-container">
      <h2>{currentQuestion.question}</h2>
      <div className="image-quiz-content">
        <div className="image-quiz-image-wrapper">
          <img src={currentQuestion.imageUrl} alt="Pregunta del quiz" className="quiz-image-large" />
        </div>
        <div className="image-quiz-answers">
          {currentQuestion.answers.map((answer: string, index: number) => {
            let buttonClass = 'image-quiz-answer-btn';
            if (selectedAnswer !== null) {
              if (index === currentQuestion.correctAnswer) {
                buttonClass += ' correct';
              } else if (index === selectedAnswer) {
                buttonClass += ' incorrect';
              }
            }
            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleAnswerClick(index)}
                disabled={selectedAnswer !== null}
              >
                {answer}
              </button>
            );
          })}
        </div>
      </div>
      {isCorrect !== null && (
        <div className={`feedback-message ${isCorrect ? 'correct-feedback' : 'incorrect-feedback'}`}>
          {isCorrect ? '¡Correcto! ✅' : 'Incorrecto. ❌'}
        </div>
      )}
    </div>
  );
};

export default ImageQuiz;
