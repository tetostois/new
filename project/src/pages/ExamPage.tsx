import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExam } from '../contexts/ExamContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { QuestionCard } from '../components/exam/QuestionCard';
import { ChevronRight, AlertCircle } from 'lucide-react';

export const ExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentExam,
    currentAnswers,
    submitAnswer,
    submitExam,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    startExam,
    endExam
  } = useExam();
  
  // États pour la gestion du temps et de la soumission
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimeLeft, setQuestionTimeLeft] = useState(120); // 2 minutes en secondes

  // Démarrer l'examen si ce n'est pas déjà fait
  useEffect(() => {
    if (!currentExam) {
      // Rediriger vers le tableau de bord si aucun examen n'est chargé
      navigate('/candidate-dashboard');
    } else {
      // Démarrer avec le premier module si nécessaire
      if (currentExam.moduleId) {
        startExam(currentExam.moduleId);
      } else {
        startExam('default-exam');
      }
      setQuestionStartTime(Date.now());
    }

    return () => {
      endExam();
    };
  }, [currentExam, navigate, startExam, endExam]);

  // Gestion du minuteur pour la question actuelle
  useEffect(() => {
    if (!currentExam) return;

    const timer = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - questionStartTime) / 1000);
      const timeLeft = Math.max(0, 120 - elapsedSeconds); // 2 minutes par question
      setQuestionTimeLeft(timeLeft);

      // Passer à la question suivante quand le temps est écoulé
      if (timeLeft <= 0) {
        handleNextQuestion();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [questionStartTime, currentExam, currentQuestionIndex]);

  // Réinitialiser le minuteur quand on change de question
  useEffect(() => {
    setQuestionStartTime(Date.now());
    setQuestionTimeLeft(120); // 2 minutes par question
  }, [currentQuestionIndex]);

  const handleAnswerChange = (answer: string | number) => {
    if (!currentExam) return;
    submitAnswer(currentExam.questions[currentQuestionIndex].id, answer);
  };

  const handleNextQuestion = () => {
    if (!currentExam) return;
    
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowSubmitModal(true);
    }
  };


  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    const success = await submitExam();
    setIsSubmitting(false);
    
    if (success) {
      // Afficher un message de succès
      alert('Module soumis avec succès ! Le module suivant est maintenant disponible.');
      navigate('/candidate-dashboard');
    } else {
      alert('Une erreur est survenue lors de la soumission du module. Veuillez réessayer.');
    }
  };

  if (!currentExam || !user) {
    return <div>Chargement de l'examen...</div>;
  }

  const currentQuestion = currentExam.questions[currentQuestionIndex];
  const currentAnswer = currentAnswers.find(a => a.questionId === currentQuestion.id)?.value;
  const answeredQuestions = currentAnswers.length;
  const totalQuestions = currentExam.questions.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentExam.title}</h1>
              <p className="text-gray-600">Module: {currentExam.moduleName}</p>
              <p className="text-gray-600">Candidat: {user.firstName} {user.lastName}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Temps restant:</span>
                <div className={`px-3 py-1 rounded-full font-mono font-bold ${
                  questionTimeLeft <= 30 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {Math.floor(questionTimeLeft / 60)}:{(questionTimeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} sur {totalQuestions}
              </div>
            </div>
          </div>
        </div>

        <Card className="mb-6 p-6">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={totalQuestions}
            currentAnswer={currentAnswer}
            onAnswerChange={handleAnswerChange}
            timeLeft={questionTimeLeft}
          />
        </Card>

        <div className="flex justify-end">
          {!isLastQuestion ? (
            <Button onClick={handleNextQuestion}>
              Suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="primary" onClick={() => setShowSubmitModal(true)}>
              Soumettre le module
            </Button>
          )}
        </div>

        {/* Navigation rapide */}
        <Card className="p-4 mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Navigation rapide</h3>
          <div className="flex flex-wrap gap-2">
            {currentExam.questions.map((_, index) => {
              const isAnswered = currentAnswers.some(a => a.questionId === currentExam.questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setQuestionStartTime(Date.now());
                    setQuestionTimeLeft(120);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isAnswered
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Modal de confirmation de soumission */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmer la soumission</h3>
                <p className="text-gray-600 mt-1">
                  Vous avez répondu à {answeredQuestions} question{answeredQuestions > 1 ? 's' : ''} sur {totalQuestions}.
                  Une fois soumis, vous ne pourrez plus modifier vos réponses.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmitExam}
                isLoading={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmer la soumission
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExamPage;
