import React, { useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { useExam } from '../../contexts/ExamContext';

export const ExamTimer: React.FC = () => {
  const { timeRemaining, setTimeRemaining, submitExam } = useExam();

  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(timeRemaining - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, setTimeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0) {
      submitExam();
    }
  }, [timeRemaining, submitExam]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeRemaining <= 300; // 5 minutes
  const isCritical = timeRemaining <= 60; // 1 minute

  return (
    <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg ${
      isCritical 
        ? 'bg-red-100 text-red-800 border border-red-200' 
        : isUrgent 
        ? 'bg-orange-100 text-orange-800 border border-orange-200'
        : 'bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      {isCritical ? (
        <AlertTriangle className="h-5 w-5 animate-pulse" />
      ) : (
        <Clock className="h-5 w-5" />
      )}
      <span className="font-bold">
        {formatTime(timeRemaining)}
      </span>
      {isUrgent && (
        <span className="text-sm">
          {isCritical ? 'URGENT!' : 'Dépêchez-vous!'}
        </span>
      )}
    </div>
  );
};