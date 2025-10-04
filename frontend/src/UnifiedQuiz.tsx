import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getQuizQuestions, UnifiedQuestion, Answer } from './quizData';
import './UnifiedQuiz.css';

interface UnifiedQuizProps {
  capturedImage?: string | null;
  detectedPlant?: string;
  onClose?: () => void;
}

const UnifiedQuiz: React.FC<UnifiedQuizProps> = ({ capturedImage, detectedPlant, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [irrigationStatus, setIrrigationStatus] = useState<string | null>(null);

  // Generar preguntas según la planta detectada
  const quizQuestions = getQuizQuestions(detectedPlant);

  // Reiniciar el quiz cada vez que se abre (cuando capturedImage cambia)
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
    setShowResult(false);
  }, [capturedImage]);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const totalQuestions = quizQuestions.length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  const handleAnswerClick = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);

    // Verificar si la respuesta es correcta según el tipo de pregunta
    let isCorrect = false;
    if (currentQuestion.type === 'text-with-images') {
      const answers = currentQuestion.answers as Answer[];
      isCorrect = answers[answerIndex].id === currentQuestion.correctAnswerId;
    } else {
      // Para imagen con texto - verificar si usamos imagen capturada
      if (currentQuestion.id === 1 && capturedImage && detectedPlant) {
        // Determinar el índice correcto basado en la planta detectada
        const plantOptions = ['Menta', 'Romero', 'Lavanda', 'Albahaca'];
        const detectedPlantCapitalized = detectedPlant.charAt(0).toUpperCase() + detectedPlant.slice(1);
        const correctIndex = plantOptions.findIndex(plant => plant === detectedPlantCapitalized);
        isCorrect = answerIndex === (correctIndex !== -1 ? correctIndex : 0);
      } else {
        isCorrect = answerIndex === currentQuestion.correctAnswer;
      }
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }

    // Incrementar preguntas respondidas
    setAnsweredQuestions(prev => prev + 1);

    // Avanzar a la siguiente pregunta después de 2 segundos
    setTimeout(() => {
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
        // Verificar si pasó el quiz para activar riego automático
        const finalCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
        if (finalCorrectAnswers >= Math.ceil(totalQuestions / 2)) {
          setTimeout(() => {
            triggerAutoIrrigation();
          }, 1000); // Esperar 1 segundo después de mostrar resultado
        }
      }
    }, 2000);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
    setShowResult(false);
    setIrrigationStatus(null);
  };

  const triggerAutoIrrigation = async () => {
    setIsIrrigating(true);
    try {
      console.log('💧 Activando riego automático...');
      const response = await axios.get('/api/irrigate');
      console.log('✅ Riego activado:', response.data);
      setIrrigationStatus('success');
    } catch (error) {
      console.error('❌ Error activando riego:', error);
      setIrrigationStatus('error');
    } finally {
      setIsIrrigating(false);
    }
  };

  if (showResult) {
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    const isPassed = correctAnswers >= Math.ceil(totalQuestions / 2);

    return (
      <div className="unified-quiz-container">
        <div className="result-container">
          {isPassed ? (
            <>
              <h4>🎉 ¡Quiz Superado!</h4>
              <p>
                Has respondido correctamente {correctAnswers} de {totalQuestions} preguntas ({percentage}%).
              </p>
              <p className="success-message">
                ¡Excelente! Has demostrado que conoces bien el cuidado de las plantas.
              </p>
              
              {/* Estado del riego automático */}
              <div className="irrigation-status">
                {isIrrigating && (
                  <p className="irrigating-message">
                    💧 Activando riego automático...
                  </p>
                )}
                {irrigationStatus === 'success' && (
                  <p className="irrigation-success">
                    ✅ ¡Riego automático activado! Tu planta ha sido regada.
                  </p>
                )}
                {irrigationStatus === 'error' && (
                  <p className="irrigation-error">
                    ❌ Error al activar el riego automático. Puedes intentar el riego manual.
                  </p>
                )}
                {!isIrrigating && !irrigationStatus && (
                  <p className="irrigation-pending">
                    💧 Activando riego automático...
                  </p>
                )}
              </div>
              
              <div className="result-actions">
                <button onClick={onClose} className="secondary-btn">
                  🔄 Continuar
                </button>
              </div>
            </>
          ) : (
            <>
              <h4>📚 Quiz No Completado</h4>
              <p>
                Has respondido correctamente {correctAnswers} de {totalQuestions} preguntas ({percentage}%).
              </p>
              <p className="improvement-message">
                Necesitas al menos {Math.ceil(totalQuestions / 2)} respuestas correctas para activar el riego automático.
                Te recomendamos repasar los conceptos y volver a intentarlo, o activar el riego manual.
              </p>
              <div className="result-actions">
                <button className="manual-watering-btn" onClick={onClose}>
                  💧 Riego Manual
                </button>
                <button onClick={resetQuiz} className="retry-btn">
                  🔄 Intentar de Nuevo
                </button>
              </div>
            </>
          )}
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

    // Usar imagen capturada solo para la primera pregunta de identificación de planta
    const imageToShow = question.id === 1 && capturedImage
      ? capturedImage
      : question.questionImageUrl;

    // Modificar la pregunta si usamos la imagen capturada
    const questionText = question.id === 1 && capturedImage
      ? '¿Qué tipo de planta es la que aparece en esta imagen que acabas de capturar?'
      : question.questionText;

    return (
      <>
        <div className="question-container">
          <h3>{questionText}</h3>
        </div>
        <div className="image-quiz-content">
          <div className="image-quiz-image-wrapper">
            <img src={imageToShow} alt="Pregunta del quiz" className="quiz-image-large" />
          </div>
          <div className="image-quiz-answers">
            {(() => {
              // Si es la primera pregunta y tenemos imagen capturada, usar respuestas de plantas
              const answersToShow = question.id === 1 && capturedImage
                ? ['Menta', 'Romero', 'Lavanda', 'Albahaca']
                : answers;

              const correctAnswerIndex = question.id === 1 && capturedImage && detectedPlant
                ? (() => {
                    const plantOptions = ['Menta', 'Romero', 'Lavanda', 'Albahaca'];
                    const detectedPlantCapitalized = detectedPlant.charAt(0).toUpperCase() + detectedPlant.slice(1);
                    const correctIndex = plantOptions.findIndex(plant => plant === detectedPlantCapitalized);
                    return correctIndex !== -1 ? correctIndex : 0;
                  })()
                : question.correctAnswer;

              return answersToShow.map((answer: string, index: number) => {
                let buttonClass = 'image-quiz-answer-btn';
                if (selectedAnswer !== null) {
                  if (index === correctAnswerIndex) {
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
              });
            })()}
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
          {answeredQuestions} de {totalQuestions} preguntas respondidas
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
              // Para imagen con texto - verificar si usamos imagen capturada
              if (currentQuestion.id === 1 && capturedImage && detectedPlant) {
                const plantOptions = ['Menta', 'Romero', 'Lavanda', 'Albahaca'];
                const detectedPlantCapitalized = detectedPlant.charAt(0).toUpperCase() + detectedPlant.slice(1);
                const correctIndex = plantOptions.findIndex(plant => plant === detectedPlantCapitalized);
                isCorrect = selectedAnswer === (correctIndex !== -1 ? correctIndex : 0);
              } else {
                isCorrect = selectedAnswer === currentQuestion.correctAnswer;
              }
            }
            return isCorrect ? '¡Correcto! ✅' : 'Incorrecto. ❌';
          })()}
        </div>
      )}
    </div>
  );
};

export default UnifiedQuiz;