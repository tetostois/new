import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type Question = {
  id: string;
  question_text: string;
  question_type: 'qcm' | 'free_text';
  instructions: string;
  points: number;
  time_limit: number;
  answer_options?: Array<{ id: string; text: string; isCorrect: boolean }>;
};

const ExamComponent: React.FC = () => {
  const { certification, module } = useParams<{ certification: string; module: string }>();
  const { getToken } = useAuth();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL de base de l'API
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  // Charger les questions publiées
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE}/api/candidate/questions?certification=${certification}&module=${module}`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
      
      // Initialiser le chronomètre avec le temps total
      if (data.questions.length > 0) {
        const totalTime = data.questions.reduce((acc: number, q: Question) => acc + q.time_limit, 0);
        setTimeLeft(totalTime * 60); // Convertir en secondes
      }
      
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les questions. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  }, [certification, module, getToken]);

  // Gestion du chronomètre
  useEffect(() => {
    if (!examStarted || !timeLeft || examFinished) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime === null) return null;
        if (prevTime <= 1) {
          clearInterval(timer);
          handleFinishExam();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted, timeLeft, examFinished]);

  // Charger les questions au montage
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleAnswerChange = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleStartExam = () => {
    setExamStarted(true);
  };

  const handleFinishExam = () => {
    setExamFinished(true);
    // Ici, vous pouvez ajouter la logique pour soumettre les réponses
    console.log('Réponses soumises:', answers);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Aucune question disponible</h3>
        <p className="mt-1 text-sm text-gray-500">Aucune question n'a été publiée pour le moment.</p>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Instructions pour l'examen</h2>
        <div className="space-y-4 mb-6">
          <p>Vous êtes sur le point de commencer l'examen pour le module <strong>{module}</strong> de la certification <strong>{certification}</strong>.</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Nombre de questions : {questions.length}</li>
            <li>Temps total : {timeLeft ? formatTime(timeLeft) : '--:--'}</li>
            <li>Une fois commencé, le chronomètre ne peut pas être arrêté</li>
            <li>Assurez-vous d'avoir une connexion Internet stable</li>
          </ul>
        </div>
        <Button onClick={handleStartExam} className="w-full">
          Commencer l'examen
        </Button>
      </div>
    );
  }

  if (examFinished) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Examen terminé</h2>
        <p className="mb-6">Merci d'avoir passé l'examen. Vos réponses ont été enregistrées.</p>
        <Button onClick={() => navigate('/dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* En-tête avec chronomètre et progression */}
      <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-lg font-medium">
          Question {currentQuestionIndex + 1} sur {questions.length}
        </div>
        <div className="text-xl font-bold text-blue-600">
          {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      {/* Question actuelle */}
      <Card className="p-6 mb-6">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-700 bg-blue-100 rounded-full mb-2">
            {currentQuestion.question_type === 'qcm' ? 'QCM' : 'Réponse libre'}
          </span>
          <h3 className="text-xl font-semibold mb-2">{currentQuestion.question_text}</h3>
          {currentQuestion.instructions && (
            <p className="text-gray-600 text-sm mb-4">{currentQuestion.instructions}</p>
          )}

          {/* Réponses */}
          <div className="mt-4 space-y-3">
            {currentQuestion.question_type === 'qcm' ? (
              currentQuestion.answer_options?.map((option) => (
                <div key={option.id} className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${option.id}`}
                    name={`question-${currentQuestion.id}`}
                    checked={answers[currentQuestion.id] === option.id}
                    onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor={`option-${option.id}`} className="ml-3 block text-gray-700">
                    {option.text}
                  </label>
                </div>
              ))
            ) : (
              <textarea
                className="w-full h-32 p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={(answers[currentQuestion.id] as string) || ''}
                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                placeholder="Votre réponse..."
              />
            )}
          </div>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
          variant="secondary"
        >
          Précédent
        </Button>
        
        {currentQuestionIndex < questions.length - 1 ? (
          <Button onClick={handleNextQuestion}>
            Suivant
          </Button>
        ) : (
          <Button onClick={handleFinishExam} variant="success">
            Terminer l'examen
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamComponent;
