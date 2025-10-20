import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Exam, Question, ExamSubmission, Answer } from '../types';

// Examens par niveau
const examsByLevel = {
  debutant: {
    id: '1',
    title: 'Examen de Leadership - Niveau Débutant',
    description: 'Évaluation des bases du leadership et de la gestion d\'équipe.',
    duration: 45, // 45 minutes pour débutant
    price: 35000, // 35,000 FCFA
    isActive: true,
    questions: [
      {
        id: '1',
        text: 'Qu\'est-ce qui caractérise un bon leader ?',
        type: 'multiple-choice' as const,
        options: [
          'Il prend toutes les décisions seul',
          'Il inspire et guide son équipe',
          'Il évite les responsabilités',
          'Il ne communique jamais'
        ],
        correctAnswer: 1,
        points: 15
      },
      {
        id: '2',
        text: 'Comment motiver une équipe ?',
        type: 'multiple-choice' as const,
        options: [
          'En imposant des sanctions',
          'En reconnaissant les efforts et en fixant des objectifs clairs',
          'En ignorant les performances',
          'En créant de la compétition malsaine'
        ],
        correctAnswer: 1,
        points: 15
      },
      {
        id: '3',
        text: 'Décrivez une situation où vous avez dû prendre une décision difficile.',
        type: 'text' as const,
        points: 20
      }
    ]
  },
  intermediaire: {
    id: '2',
    title: 'Examen de Leadership - Niveau Intermédiaire',
    description: 'Évaluation approfondie des compétences en leadership et gestion de conflits.',
    duration: 60, // 60 minutes
    price: 50000, // 50,000 FCFA
    isActive: true,
    questions: [
      {
        id: '1',
        text: 'Qu\'est-ce qui caractérise le mieux un leader transformationnel ?',
        type: 'multiple-choice' as const,
        options: [
          'Il se concentre uniquement sur les résultats financiers',
          'Il inspire et motive ses équipes vers une vision commune',
          'Il évite de prendre des risques',
          'Il délègue toutes ses responsabilités'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        id: '2',
        text: 'Comment un leader doit-il réagir face à un conflit dans son équipe ?',
        type: 'multiple-choice' as const,
        options: [
          'Ignorer le conflit en espérant qu\'il se résolve seul',
          'Prendre parti pour l\'un des membres',
          'Faciliter la communication entre les parties pour trouver une solution',
          'Licencier tous les membres impliqués'
        ],
        correctAnswer: 2,
        points: 10
      },
      {
        id: '3',
        text: 'Décrivez votre approche pour développer les compétences de votre équipe.',
        type: 'text' as const,
        points: 20
      },
      {
        id: '4',
        text: 'Quelle est l\'importance de la communication dans le leadership ?',
        type: 'multiple-choice' as const,
        options: [
          'Elle n\'est pas importante si les résultats sont bons',
          'Elle permet d\'établir la confiance et l\'alignement',
          'Elle ralentit les processus de décision',
          'Elle crée de la confusion'
        ],
        correctAnswer: 1,
        points: 10
      },
      {
        id: '5',
        text: 'Comment évalueriez-vous le succès d\'une initiative de leadership que vous avez menée ?',
        type: 'text' as const,
        points: 25
      }
    ]
  },
  expert: {
    id: '3',
    title: 'Examen de Leadership - Niveau Expert',
    description: 'Évaluation avancée des compétences stratégiques et de leadership organisationnel.',
    duration: 90, // 90 minutes pour expert
    price: 75000, // 75,000 FCFA
    isActive: true,
    questions: [
      {
        id: '1',
        text: 'Dans un contexte de transformation organisationnelle, quelle approche de leadership est la plus efficace ?',
        type: 'multiple-choice' as const,
        options: [
          'Leadership autocratique pour imposer les changements',
          'Leadership adaptatif combinant vision, communication et accompagnement',
          'Leadership laissez-faire pour laisser l\'équipe s\'adapter',
          'Leadership transactionnel basé sur les récompenses'
        ],
        correctAnswer: 1,
        points: 15
      },
      {
        id: '2',
        text: 'Comment gérer la résistance au changement dans une organisation ?',
        type: 'text' as const,
        points: 25
      },
      {
        id: '3',
        text: 'Analysez les défis du leadership multiculturel dans un environnement globalisé.',
        type: 'text' as const,
        points: 30
      },
      {
        id: '4',
        text: 'Quelle est la différence entre management et leadership ?',
        type: 'multiple-choice' as const,
        options: [
          'Il n\'y a aucune différence',
          'Le management gère les processus, le leadership inspire les personnes',
          'Le leadership est moins important que le management',
          'Le management est plus créatif que le leadership'
        ],
        correctAnswer: 1,
        points: 15
      },
      {
        id: '5',
        text: 'Développez une stratégie de leadership pour une équipe virtuelle internationale.',
        type: 'text' as const,
        points: 35
      }
    ]
  }
};
interface ExamContextType {
  currentExam: Exam | null;
  currentAnswers: Answer[];
  timeRemaining: number;
  isExamActive: boolean;
  startExam: (level: 'debutant' | 'intermediaire' | 'expert') => void;
  submitAnswer: (questionId: string, answer: string | number) => void;
  submitExam: () => Promise<boolean>;
  setTimeRemaining: (time: number) => void;
  getExamByLevel: (level: 'debutant' | 'intermediaire' | 'expert') => Exam;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);


export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isExamActive, setIsExamActive] = useState(false);

  const getExamByLevel = (level: 'debutant' | 'intermediaire' | 'expert'): Exam => {
    return examsByLevel[level];
  };

  const startExam = (level: 'debutant' | 'intermediaire' | 'expert') => {
    const exam = getExamByLevel(level);
    setCurrentExam(exam);
    setCurrentAnswers([]);
    setTimeRemaining(exam.duration * 60); // Convert to seconds
    setIsExamActive(true);
  };

  const submitAnswer = (questionId: string, answer: string | number) => {
    setCurrentAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, value: answer };
        return updated;
      }
      return [...prev, { questionId, value: answer }];
    });
  };

  const submitExam = async (): Promise<boolean> => {
    if (!currentExam) return false;
    
    // Simulation de la soumission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const submission: ExamSubmission = {
      id: Date.now().toString(),
      candidateId: '3', // Mock candidate ID
      examId: currentExam.id,
      answers: currentAnswers,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    console.log('Exam submitted:', submission);
    
    setIsExamActive(false);
    setCurrentExam(null);
    setCurrentAnswers([]);
    setTimeRemaining(0);
    
    return true;
  };

  const value: ExamContextType = {
    currentExam,
    currentAnswers,
    timeRemaining,
    isExamActive,
    startExam,
    submitAnswer,
    submitExam,
    setTimeRemaining,
    getExamByLevel,
  };

  return (
    <ExamContext.Provider value={value}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error('useExam must be used within an ExamProvider');
  }
  return context;
};
