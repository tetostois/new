import React, { useState } from 'react';
import { Question } from '../../types';
import { Card } from '../ui/Card';
import { Clock, AlertCircle } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  currentAnswer?: string | number;
  onAnswerChange: (answer: string | number) => void;
  timeLeft?: number; // Temps restant en secondes
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionNumber,
  totalQuestions,
  currentAnswer,
  onAnswerChange,
  timeLeft = 0
}) => {
  const [textAnswer, setTextAnswer] = useState(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );

  const handleTextChange = (value: string) => {
    setTextAnswer(value);
    onAnswerChange(value);
  };

  const handleOptionSelect = (index: number) => {
    onAnswerChange(index);
  };

  // Formatage du temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Vérification si le temps est critique (moins de 30 secondes)
  const isTimeCritical = timeLeft !== undefined && timeLeft <= 30;

  return (
    <Card className="mb-6">
      <div className="mb-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3">
          <div>
            <span className="text-sm font-medium text-blue-600">
              Question {questionNumber} sur {totalQuestions}
            </span>
            <span className="text-sm text-gray-500 ml-3">
              {question.points} point{question.points > 1 ? 's' : ''}
            </span>
          </div>
          
          {timeLeft !== undefined && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isTimeCritical 
                ? 'bg-red-100 text-red-800' 
                : 'bg-blue-100 text-blue-800'
            }`}>
              {isTimeCritical ? (
                <AlertCircle className="h-4 w-4 animate-pulse" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
              <span className="font-mono">{formatTime(timeLeft)}</span>
              {isTimeCritical && <span className="text-xs ml-1">Dépêchez-vous!</span>}
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 leading-relaxed mb-4">
          {question.text}
        </h3>
      </div>

      {question.type === 'multiple-choice' && question.options && (
        <div className="space-y-3">
          {question.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                currentAnswer === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={index}
                checked={currentAnswer === index}
                onChange={() => handleOptionSelect(index)}
                className="mt-1 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-900 leading-relaxed">{option}</span>
            </label>
          ))}
        </div>
      )}

      {question.type === 'text' && (
        <div>
          <textarea
            value={textAnswer}
            onChange={(e) => handleTextChange(e.target.value)}
            className={`w-full p-4 border-2 ${
              isTimeCritical ? 'border-red-300' : 'border-gray-300'
            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors`}
            rows={6}
            placeholder="Saisissez votre réponse détaillée ici..."
          />
          <div className="mt-2 flex flex-col sm:flex-row justify-between gap-2 text-sm text-gray-500">
            <span>Développez votre réponse avec des exemples concrets</span>
            <div className="flex items-center gap-2">
              <span>{textAnswer.length} caractères</span>
              {timeLeft === 0 && (
                <span className="text-red-600 font-medium flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  Temps écoulé
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};