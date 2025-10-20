import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Exam, Answer, Question } from '../types';
import { mapCertificationToBackendSlug, mapModuleToBackendSlug } from '../utils/mapping';
import apiRequest from '../config/api';

interface ExamContextType {
  // État de l'examen
  currentExam: Exam | null;
  currentAnswers: Answer[];
  timeRemaining: number;
  isExamActive: boolean;
  currentQuestionIndex: number;
  completedExams: string[];
  
  // Fonctions de gestion de l'examen
  startExam: (examId: string) => void;
  startModule: (certificationId: string, moduleId: string) => void;
  submitAnswer: (questionId: string, answer: string | number) => void;
  submitExam: () => Promise<boolean>;
  setCurrentQuestionIndex: (index: number) => void;
  setTimeRemaining: (time: number) => void;
  endExam: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // État principal de l'examen
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [currentAnswers, setCurrentAnswers] = useState<Answer[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isExamActive, setIsExamActive] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [completedExams, setCompletedExams] = useState<string[]>([]);
  
  // Fonction pour démarrer un module spécifique (récupération réelle depuis l'API)
  const startModule = async (certificationId: string, moduleId: string) => {
    try {
      // Normaliser les identifiants pour correspondre aux slugs backend
      const certSlug = mapCertificationToBackendSlug(certificationId);
      const moduleSlug = mapModuleToBackendSlug(moduleId);

      // Récupération des questions publiées pour une certification et un module
      // On supporte les deux formats de réponse: { data: [] } ou []
      const endpoint = `/candidate/questions?certification_type=${encodeURIComponent(certSlug)}&module=${encodeURIComponent(moduleSlug)}`;
      console.log('[Exam] startModule params:', { certificationId, moduleId });
      console.log('[Exam] mapped slugs:', { certSlug, moduleSlug });

      let data: any = await apiRequest<any>(endpoint, 'GET');
      let rawList: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : [];

      // Fallback 1: réessayer avec les identifiants d'origine s'il n'y a aucun résultat
      if (!rawList.length) {
        const endpointFallback = `/candidate/questions?certification=${encodeURIComponent(certificationId)}&module=${encodeURIComponent(moduleId)}`;
        console.warn('[Exam] Aucune question avec slugs. Nouvelle tentative avec ids UI:', { endpointFallback });
        data = await apiRequest<any>(endpointFallback, 'GET');
        rawList = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.questions)
            ? data.questions
            : Array.isArray(data)
              ? data
              : [];
      }

      if (!rawList.length) {
        console.warn('[Exam] Toujours aucun résultat.', { endpoint, certificationId, moduleId, certSlug, moduleSlug, response: data });
        alert("Aucune question disponible pour ce module. Veuillez réessayer plus tard.");
        return;
      }

      // Mapping backend -> frontend Question
      const mappedQuestions: Question[] = rawList.map((raw: any) => {
        const isQcm = String(raw.question_type || raw.type || '').toLowerCase() === 'qcm' || String(raw.question_type || '').toLowerCase() === 'multiple-choice';
        return {
          id: String(raw.id ?? ''),
          text: String(raw.question_text ?? raw.text ?? ''),
          type: isQcm ? 'multiple-choice' : 'text',
          options: isQcm && Array.isArray(raw.answer_options)
            ? raw.answer_options.map((o: any) => String(o.text ?? o.label ?? ''))
            : undefined,
          points: Number(raw.points ?? 1),
          category: String(raw.module ?? raw.category ?? moduleId)
        } as Question;
      });

      // Calcul du temps total: somme des time_limit (en secondes) -> minutes arrondies vers le haut
      const totalSeconds = rawList.reduce((sum: number, raw: any) => sum + Number(raw.time_limit ?? 60), 0);
      const durationMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      const builtExam: Exam = {
        id: `${certificationId}-${moduleId}`,
        title: `Module ${moduleId}`,
        description: `Examen du module ${moduleId} pour ${certificationId}`,
        moduleName: `Module ${moduleId}`,
        duration: durationMinutes,
        isActive: true,
        price: 0,
        questions: mappedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ajouter les propriétés nécessaires pour la soumission
        certificationType: certSlug,
        moduleId: moduleSlug
      };

      setCurrentExam(builtExam);
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
      setTimeRemaining(totalSeconds);
      setIsExamActive(true);
    } catch (error) {
      console.error('[Exam] Erreur lors du chargement des questions:', error);
      alert("Impossible de charger les questions de ce module. Veuillez réessayer.");
    }
  };

  // Fonction pour démarrer un examen complet (fallback vers la même logique en utilisant examId comme moduleId)
  const startExam = async (examId: string) => {
    // Par défaut, tenter de charger via l'endpoint candidat sans certification explicite
    try {
      const endpoint = `/candidate/questions?exam_id=${encodeURIComponent(examId)}`;
      const data: any = await apiRequest<any>(endpoint, 'GET');
      const rawList: any[] = Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.questions)
          ? data.questions
          : Array.isArray(data)
            ? data
            : [];

      if (!rawList.length) {
        alert("Aucune question disponible pour cet examen. Veuillez réessayer plus tard.");
        return;
      }

      const mappedQuestions: Question[] = rawList.map((raw: any) => {
        const isQcm = String(raw.question_type || raw.type || '').toLowerCase() === 'qcm' || String(raw.question_type || '').toLowerCase() === 'multiple-choice';
        return {
          id: String(raw.id ?? ''),
          text: String(raw.question_text ?? raw.text ?? ''),
          type: isQcm ? 'multiple-choice' : 'text',
          options: isQcm && Array.isArray(raw.answer_options)
            ? raw.answer_options.map((o: any) => String(o.text ?? o.label ?? ''))
            : undefined,
          points: Number(raw.points ?? 1),
          category: String(raw.module ?? raw.category ?? 'général')
        } as Question;
      });

      const totalSeconds = rawList.reduce((sum: number, raw: any) => sum + Number(raw.time_limit ?? 60), 0);
      const durationMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

      const builtExam: Exam = {
        id: examId,
        title: 'Examen de certification',
        description: 'Examen de certification',
        moduleName: rawList?.[0]?.module ? String(rawList[0].module) : 'Examen',
        duration: durationMinutes,
        isActive: true,
        price: 0,
        questions: mappedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentExam(builtExam);
      setCurrentAnswers([]);
      setCurrentQuestionIndex(0);
      setTimeRemaining(totalSeconds);
      setIsExamActive(true);
    } catch (e) {
      console.error('[Exam] Erreur lors du chargement de l\'examen:', e);
      alert("Impossible de charger l'examen. Veuillez réessayer.");
    }
  };

  // Fonction pour soumettre une réponse
  const submitAnswer = (questionId: string, answer: string | number) => {
    setCurrentAnswers(prev => {
      const existingIndex = prev.findIndex(a => a.questionId === questionId);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { questionId, value: answer };
        return updated;
      }
      return [...prev, { questionId, value: answer }];
    });
  };

  // Fonction pour soumettre l'examen
  const submitExam = async (): Promise<boolean> => {
    if (!currentExam) return false;
    
    try {
      // Préparer les données pour la soumission
      const examId = `exam-${currentExam.certificationType}-${currentExam.moduleId}`;
      const answers = currentAnswers.reduce((acc, answer) => {
        acc[answer.questionId] = answer.value;
        return acc;
      }, {} as Record<string, string | number>);
      
      console.log('Soumission de l\'examen:', examId);
      console.log('Réponses soumises:', answers);
      
      // Soumettre l'examen via l'API
      const response = await apiRequest('/candidate/exam-submissions/submit', 'POST', {
        exam_id: examId,
        answers: answers,
        certification_type: currentExam.certificationType,
        module_id: currentExam.moduleId
      });
      
      if (response.success) {
        console.log('Examen soumis avec succès:', response);
        console.log(`Score: ${response.score}/${response.max_score} (${response.percentage}%)`);
        
        // Marquer l'examen comme terminé
        setCompletedExams(prev => [...prev, currentExam.id]);
        
        // Le déverrouillage du module suivant est géré automatiquement par le backend
        console.log('Module suivant déverrouillé automatiquement');
        
        // Déclencher un événement pour recharger la progression des modules
        console.log('🎯 [ExamContext] Déclenchement de l\'événement examSubmitted...');
        console.log('🎯 [ExamContext] Détails de l\'événement:', {
          certificationType: currentExam.certificationType,
          moduleId: currentExam.moduleId,
          score: response.score,
          maxScore: response.max_score
        });
        
        const event = new CustomEvent('examSubmitted', { 
          detail: { 
            certificationType: currentExam.certificationType,
            moduleId: currentExam.moduleId,
            score: response.score,
            maxScore: response.max_score
          } 
        });
        
        window.dispatchEvent(event);
        console.log('🎯 [ExamContext] Événement examSubmitted déclenché');
      } else {
        throw new Error(response.message || 'Erreur lors de la soumission');
      }
      
      // Réinitialiser l'état
      setCurrentExam(null);
      setCurrentAnswers([]);
      setIsExamActive(false);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la soumission de l\'examen:', error);
      return false;
    }
  };

  // Fonction pour terminer l'examen
  const endExam = () => {
    setCurrentExam(null);
    setCurrentAnswers([]);
    setCurrentQuestionIndex(0);
    setTimeRemaining(0);
    setIsExamActive(false);
  };

  // Valeur du contexte
  const value = {
    currentExam,
    currentAnswers,
    timeRemaining,
    isExamActive,
    currentQuestionIndex,
    completedExams,
    startExam,
    startModule,
    submitAnswer,
    submitExam,
    setCurrentQuestionIndex,
    setTimeRemaining,
    endExam
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
    throw new Error('useExam doit être utilisé à l\'intérieur d\'un ExamProvider');
  }
  return context;
};
