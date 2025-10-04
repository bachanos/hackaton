import React, { useState } from 'react';
import { unifiedQuizQuestions, UnifiedQuestion, Answer } from './quizData';
import './UnifiedQuiz.css';

const UnifiedQuiz: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = unifiedQuizQuestions[currentQuestionIndex];
  const totalQuestions = unifiedQuizQuestions.length;
  const progressPercentage = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    // Verificar si la respuesta es correcta según el tipo de pregunta
    let isCorrect = false;
    if (currentQuestion.type === 'text-with-images') {
      const answers = currentQuestion.answers as Answer[];
      isCorrect = answers[answerIndex].id === currentQuestion.correctAnswerId;
    } else {
      isCorrect = answerIndex === currentQuestion.correctAnswer;
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Avanzar a la siguiente pregunta después de 2 segundos
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setShowResult(false);
  };

  if (showResult) {
    return (
      <div className="unified-quiz-container">
        <div className="result-container">
          <h4>¡Quiz Completado!</h4>
          <p>
            Has respondido correctamente {correctAnswers} de {totalQuestions} preguntas
            ({Math.round((correctAnswers / totalQuestions) * 100)}%).
          </p>
          <button onClick={resetQuiz}>Repetir Quiz</button>
        </div>
      </div>
    );
  }

  // Renderizar pregunta tipo texto con respuestas imagen
  const renderTextWithImages = (question: UnifiedQuestion) => {
    const answers = question.answers as Answer[];
    
    return (
      <>
        <div className="question-container">
          <h3>{question.questionText}</h3>
        </div>
        <div className="answers-grid">
          {answers.map((answer, index) => {
            let cardClass = 'answer-card';
            if (selectedAnswer !== null) {
              if (answer.id === question.correctAnswerId) {
                cardClass += ' correct';
              } else if (index === selectedAnswer) {
                cardClass += ' incorrect';
              }
            }
            
            return (
              <div
                key={answer.id}
                className={cardClass}
                onClick={() => handleAnswerClick(index)}
              >
                <img src={answer.imageUrl} alt={answer.text} />
                <p>{answer.text}</p>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // Renderizar pregunta tipo imagen con respuestas texto
  const renderImageWithText = (question: UnifiedQuestion) => {
    const answers = question.answers as string[];
    
    return (
      <>
        <div className="question-container">
          <h3>{question.questionText}</h3>
        </div>
        <div className="image-quiz-content">
          <div className="image-quiz-image-wrapper">
            <img src={question.questionImageUrl} alt="Pregunta del quiz" className="quiz-image-large" />
          </div>
          <div className="image-quiz-answers">
            {answers.map((answer: string, index: number) => {
              let buttonClass = 'image-quiz-answer-btn';
              if (selectedAnswer !== null) {
                if (index === question.correctAnswer) {
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
      </>
    );
  };

  return (
    <div className="unified-quiz-container">
      {/* Barra de progreso */}
      <div className="progress-container">
        <div className="progress-bar-background">
          <div 
            className="progress-bar-foreground" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="progress-text">
          Pregunta {currentQuestionIndex + 1} de {totalQuestions} • Correctas: {correctAnswers}
        </p>
      </div>

      {/* Contenido de la pregunta según su tipo */}
      {currentQuestion.type === 'text-with-images' 
        ? renderTextWithImages(currentQuestion)
        : renderImageWithText(currentQuestion)
      }

      {/* Feedback cuando se selecciona una respuesta */}
      {selectedAnswer !== null && (
        <div className="feedback-message">
          {(() => {
            let isCorrect = false;
            if (currentQuestion.type === 'text-with-images') {
              const answers = currentQuestion.answers as Answer[];
              isCorrect = answers[selectedAnswer].id === currentQuestion.correctAnswerId;
            } else {
              isCorrect = selectedAnswer === currentQuestion.correctAnswer;
            }
            return isCorrect ? '¡Correcto! ✅' : 'Incorrecto. ❌';
          })()}
        </div>
      )}
    </div>
  );
};

export default UnifiedQuiz;