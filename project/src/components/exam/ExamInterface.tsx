import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Send, AlertCircle } from 'lucide-react';
import { useExam } from '../../contexts/ExamContext';
import { useAuth } from '../../contexts/AuthContext';
import { ExamTimer } from './ExamTimer';
import { QuestionCard } from './QuestionCard';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const ExamInterface: React.FC = () => {
  const { currentExam, currentAnswers, submitAnswer, submitExam } = useExam();
  const { user } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [perQuestionTimeLeft, setPerQuestionTimeLeft] = useState<number>(0);
  const [timerReady, setTimerReady] = useState<boolean>(false);
  const autoAdvancedIndexRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  if (!currentExam || !user) return null;

  const currentQuestion = currentExam.questions[currentQuestionIndex];
  const currentAnswer = currentAnswers.find(a => a.questionId === currentQuestion.id)?.value;
  const totalQuestions = currentExam.questions.length;
  
  const handleAnswerChange = (answer: string | number) => {
    submitAnswer(currentQuestion.id, answer);
  };

  const handleNext = () => {
    if (currentQuestionIndex < currentExam.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const success = await submitExam();
    setIsSubmitting(false);
    setShowSubmitModal(false);
  };

  const answeredQuestions = currentAnswers.length;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  // Avancer automatiquement à la question suivante quand le temps est écoulé
  const moveToNextQuestion = async () => {
    // Stop current interval to éviter multi-déclenchements
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (currentQuestionIndex >= totalQuestions - 1) {
      setIsSubmitting(true);
      try {
        await submitExam();
      } finally {
        setIsSubmitting(false);
      }
      return;
    }
    // Décaler à la prochaine frame pour éviter les courses avec setState du timer
    setTimeout(() => {
      setCurrentQuestionIndex(prev => (prev < totalQuestions - 1 ? prev + 1 : prev));
    }, 0);
  };

  // Initialiser le temps alloué pour la question courante
  useEffect(() => {
    const defaultSeconds = Number(currentQuestion.timeLimit ?? 60);
    setTimerReady(false);
    setPerQuestionTimeLeft(defaultSeconds > 0 ? defaultSeconds : 60);
    // Autoriser un nouvel auto-avancement uniquement pour cet index
    autoAdvancedIndexRef.current = null;
    // Activer le timer dans une nouvelle frame pour éviter un double saut
    const ready = setTimeout(() => setTimerReady(true), 0);
    return () => clearTimeout(ready);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  // Décrément du timer par question (tick indépendant, contrôle au tick)
  useEffect(() => {
    if (!timerReady) return;
    const t = setInterval(() => {
      setPerQuestionTimeLeft(prev => {
        if (prev <= 1) {
          // À l'expiration, avancer une seule fois
          if (autoAdvancedIndexRef.current !== currentQuestionIndex) {
            autoAdvancedIndexRef.current = currentQuestionIndex;
            void moveToNextQuestion();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    intervalRef.current = t;
    return () => {
      clearInterval(t);
      intervalRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, timerReady]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{currentExam.title}</h1>
              <p className="text-gray-600">Candidat: {user.firstName} {user.lastName}</p>
            </div>
            <ExamTimer />
          </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progression: {answeredQuestions}/{totalQuestions} questions répondues
              </span>
              <span className="text-sm text-gray-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
          currentAnswer={currentAnswer}
          onAnswerChange={handleAnswerChange}
          timeLeft={perQuestionTimeLeft}
        />

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={true}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Précédent</span>
          </Button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              {currentQuestionIndex + 1} / {totalQuestions}
            </span>
          </div>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <Button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700"
            >
              <Send className="h-4 w-4" />
              <span>Soumettre l'examen</span>
            </Button>
          ) : (
            <Button
              onClick={moveToNextQuestion}
              className="flex items-center space-x-2"
            >
              <span>Suivant</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Question Navigation */}
        <Card>
          <h3 className="font-medium text-gray-900 mb-3">Navigation rapide</h3>
          <div className="flex flex-wrap gap-2">
            {currentExam.questions.map((_, index) => {
              const isAnswered = currentAnswers.some(a => a.questionId === currentExam.questions[index].id);
              const isCurrent = index === currentQuestionIndex;
              const isDisabled = index !== currentQuestionIndex;
              return (
                <button
                  key={index}
                  onClick={() => { if (!isDisabled) setCurrentQuestionIndex(index); }}
                  disabled={isDisabled}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : isDisabled
                      ? 'bg-gray-100 text-gray-400'
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

      {/* Submit Modal */}
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
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};