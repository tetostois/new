import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, UserPlus, FileText, Settings, LogOut, CheckCircle, Clock, Search, 
  Filter, ChevronDown, Plus, Download, Upload, Eye, Edit, Trash2, X, Check, 
  ChevronLeft, ChevronRight, MoreVertical, Calendar, Clock as ClockIcon, 
  AlertCircle, BarChart2, CreditCard, File, UserCheck, UserX, Mail, Phone, 
  Home, MapPin, Hash, Award, BookOpen, Book, BookMarked, BookOpenCheck, 
  BookKey, BookLock, BookMarkedCheck, BookMarkedX, BookMarkedMinus, 
  BookMarkedPlus, BookPlus, BookMinus, BookX, BookCheck, BookOpenText, 
  BookOpenTextIcon, BookTemplate, BookUp, BookDown, BookUp2, BookDown2, HelpCircle
} from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { AdminService } from '../services/adminService';
import Pagination from '../components/Pagination';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'admin' | 'examiner' | 'candidate';
  isActive: boolean;
  createdAt: string;
  profession?: string;
  specialization?: string;
  experience?: string;
}

interface Examiner {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  experience: string;
  isActive: boolean;
  assignedExams: number;
}

interface ExamSubmissionItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  assignedTo?: string;
  score?: number;
}

interface Payment {
  id: string;
  candidateName: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

interface Certificate {
  id: string;
  candidateName: string;
  score: number;
  issuedAt: string;
  downloadUrl: string;
}

type QuestionType = 'qcm' | 'free_text';

type CertificationType = 
  | 'initiation_pratique_generale'
  | 'cadre_manager_professionnel'
  | 'rentabilite_entrepreneuriale'
  | 'chef_dirigeant_entreprise_africaine'
  | 'investisseur_entreprises_africaines'
  | 'ingenieries_specifiques';

type ModuleType = 'leadership' | 'competences_professionnelles' | 'entrepreneuriat';

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface ExamQuestion {
  id: string;
  certificationType: CertificationType;
  module: ModuleType;
  questionType: QuestionType;
  questionText: string;
  referenceAnswer: string;
  instructions: string;
  points: number;
  timeLimit: number; // en secondes
  isRequired: boolean;
  answerOptions?: AnswerOption[];
  createdAt: string;
  updatedAt: string;
  isPublished?: boolean;
  publishedAt?: string;
}

interface ExamSubmissionData {
  id: string;
  examId: string;
  candidateId: string;
  candidateName: string;
  answers: {
    questionId: string;
    answer: string | string[];
    submittedAt: string;
    score?: number;
    feedback?: string;
  }[];
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  startedAt: string;
  submittedAt?: string;
  gradedAt?: string;
  totalScore?: number;
  examinerId?: string;
}

interface ExamAssignment {
  id: string;
  examId: string;
  examinerId: string;
  assignedAt: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  submissionId?: string;
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showExaminerModal, setShowExaminerModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedExaminer, setSelectedExaminer] = useState<Examiner | null>(null);
  const [recentActivities, setRecentActivities] = useState<Array<{
    id: string;
    type: string;
    description: string;
    user: { id: string; name: string; email: string; } | null;
    data: any;
    created_at: string;
    timestamp: string;
  }>>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // Charger les activités récentes
  const loadRecentActivities = async () => {
    try {
      setLoadingActivities(true);
      const response = await fetch(`${API_BASE}/activities/recent?limit=5`);
      const result = await response.json();
      
      if (result.success) {
        setRecentActivities(result.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  // Charger les activités au montage du composant
  useEffect(() => {
    if (activeSection === 'dashboard') {
      loadRecentActivities();
    }
  }, [activeSection]);

  // API base and helpers
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const getToken = () => localStorage.getItem('token') || '';
  const normalizeUserFromBackend = (raw: any): User => ({
    id: String(raw.id ?? raw.uuid ?? ''),
    firstName: raw.firstName ?? raw.first_name ?? '',
    lastName: raw.lastName ?? raw.last_name ?? '',
    email: raw.email ?? '',
    phone: raw.phone ?? '',
    role: (raw.role ?? 'candidate') as User['role'],
    isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
    profession: raw.profession ?? '',
    specialization: raw.specialization ?? '',
    experience: raw.experience ?? '',
  });

  // Questions helpers
  const normalizeQuestionFromBackend = (raw: any): ExamQuestion => ({
    id: String(raw.id),
    certificationType: raw.certification_type,
    module: raw.module,
    questionType: raw.question_type,
    questionText: raw.question_text,
    referenceAnswer: raw.reference_answer || '',
    instructions: raw.instructions || '',
    points: Number(raw.points),
    timeLimit: Number(raw.time_limit),
    isRequired: Boolean(raw.is_required),
    answerOptions: Array.isArray(raw.answer_options) ? raw.answer_options.map((o: any) => ({ id: String(o.id ?? ''), text: o.text ?? '', isCorrect: !!o.isCorrect })) : undefined,
    createdAt: raw.created_at ?? new Date().toISOString(),
    updatedAt: raw.updated_at ?? new Date().toISOString(),
    isPublished: !!raw.is_published,
    publishedAt: raw.published_at ?? undefined,
  });
  const toExaminer = (u: User): Examiner => ({
    id: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    email: u.email,
    phone: u.phone,
    specialization: u.specialization || '—',
    experience: u.experience || '',
    isActive: u.isActive,
    assignedExams: 0,
  });

  // Data from API
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(20);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [examiners, setExaminers] = useState<Examiner[]>([]);
  const [examinersPage, setExaminersPage] = useState(1);
  const [examinersPerPage, setExaminersPerPage] = useState(20);
  const [examinersTotal, setExaminersTotal] = useState(0);
  const [examinersTotalPages, setExaminersTotalPages] = useState(1);

  // Exam submissions state (déclaré avant tout usage)
  const [examSubmissionsState, setExamSubmissionsState] = useState<ExamSubmissionData[]>([]);
  const [submissionsPage, setSubmissionsPage] = useState(1);
  const [submissionsPerPage, setSubmissionsPerPage] = useState(20);
  const [submissionsTotal, setSubmissionsTotal] = useState(0);
  const [submissionsTotalPages, setSubmissionsTotalPages] = useState(1);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', String(usersPage));
      params.append('per_page', String(usersPerPage));
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: any[] = Array.isArray(data?.data) ? data.data : [];
      const mapped: User[] = list.map((raw: any) => normalizeUserFromBackend(raw));
      setUsers(mapped);
      setExaminers(mapped.filter((u: User) => u.role === 'examiner').map(toExaminer));
      if (data?.pagination) {
        setUsersTotal(Number(data.pagination.total || 0));
        setUsersTotalPages(Number(data.pagination.last_page || 1));
      }
    } catch {}
  };

  useEffect(() => { if (activeSection === 'users') loadUsers(); }, [activeSection, usersPage, usersPerPage, searchTerm, statusFilter]);

  // Charger les examinateurs paginés
  const loadExaminers = async () => {
    try {
      const params = new URLSearchParams();
      params.append('role', 'examiner');
      params.append('page', String(examinersPage));
      params.append('per_page', String(examinersPerPage));
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const list: any[] = Array.isArray(data?.data) ? data.data : [];
      const mapped: User[] = list.map((raw: any) => normalizeUserFromBackend(raw));
      setExaminers(mapped.filter((u: User) => u.role === 'examiner').map(toExaminer));
      if (data?.pagination) {
        setExaminersTotal(Number(data.pagination.total || 0));
        setExaminersTotalPages(Number(data.pagination.last_page || 1));
      }
    } catch {}
  };

  useEffect(() => {
    if (activeSection === 'examiners') loadExaminers();
  }, [activeSection, examinersPage, examinersPerPage]);

  // Charger les soumissions d'examens au montage
  useEffect(() => { loadExamSubmissions(); }, []);

  // Charger les soumissions d'examens
  const loadExamSubmissions = async () => {
    try {
      setLoadingSubmissions(true);
      setSubmissionsError(null);
      const response = await AdminService.getExamSubmissions(
        { status: statusFilter === 'all' ? undefined : statusFilter },
        { page: submissionsPage, per_page: submissionsPerPage }
      );
      
      if (response.success) {
        // Transformer les données de l'API vers le format attendu par l'interface
        const transformedSubmissions: ExamSubmissionData[] = response.submissions.map((sub: any) => ({
          id: sub.id.toString(),
          examId: sub.exam_id,
          candidateId: sub.candidate_id.toString(),
          candidateName: sub.candidate_name || `${sub.candidate?.first_name || ''} ${sub.candidate?.last_name || ''}`.trim(),
          answers: Object.entries(sub.answers || {}).map(([questionId, answer]) => ({
            questionId,
            answer: answer as string,
            submittedAt: sub.submitted_at || new Date().toISOString(),
            score: 0,
            feedback: ''
          })),
          status: sub.status,
          startedAt: sub.started_at,
          submittedAt: sub.submitted_at,
          gradedAt: sub.graded_at,
          totalScore: sub.total_score || 0,
          examinerId: sub.examiner_id?.toString()
        }));
        
        setExamSubmissionsState(transformedSubmissions);
        if (response.pagination) {
          setSubmissionsTotal(Number(response.pagination.total || 0));
          setSubmissionsTotalPages(Number(response.pagination.last_page || 1));
        }
      } else {
        setSubmissionsError('Erreur lors du chargement des soumissions');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des soumissions:', error);
      setSubmissionsError('Erreur lors du chargement des soumissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Charger les soumissions au montage et quand la section change
  useEffect(() => {
    if (activeSection === 'exams') {
      loadExamSubmissions();
    }
  }, [activeSection, statusFilter, submissionsPage, submissionsPerPage]);

  // (états déplacés plus haut pour éviter la TDZ)

  // Exam assignments state - tracks examiner assignments to submissions
  const [examAssignmentsState, setExamAssignmentsState] = useState<ExamAssignment[]>([
    {
      id: '1',
      examId: 'exam-initiation_pratique_generale-leadership',
      examinerId: '1',
      assignedAt: '2024-01-10T09:00:00Z',
      status: 'completed',
      completedAt: '2024-01-12T15:30:00Z',
      submissionId: '3' // Matches the graded submission
    },
    {
      id: '2',
      examId: 'exam-initiation_pratique_generale-leadership',
      examinerId: '2',
      assignedAt: '2024-01-11T10:00:00Z',
      status: 'in_progress',
      submissionId: '2' // Matches the under_review submission
    }
  ]);

  const [payments] = useState<Payment[]>([
    {
      id: '1',
      candidateName: 'Marie Dubois',
      amount: 50000,
      method: 'Orange Money',
      status: 'completed',
      date: '2024-01-15'
    },
    {
      id: '2',
      candidateName: 'Paul Nkomo',
      amount: 50000,
      method: 'PayPal',
      status: 'completed',
      date: '2024-01-14'
    }
  ]);

  // État pour la gestion des questions d'examen
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<ExamQuestion>>({
    questionType: 'qcm',
    isRequired: true,
    points: 1,
    timeLimit: 60,
    answerOptions: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false }
    ]
  });
  const [selectedCertification, setSelectedCertification] = useState<CertificationType>('initiation_pratique_generale');
  const [selectedModule, setSelectedModule] = useState<ModuleType>('leadership');
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState<{
    certificationType: CertificationType;
    module: ModuleType;
  } | null>({
    certificationType: 'initiation_pratique_generale',
    module: 'leadership'
  });
  
  const [currentExamSubmission, setCurrentExamSubmission] = useState<ExamSubmissionData | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [grades, setGrades] = useState<Record<string, { score: number; feedback: string }>>({});

  // Chargement des questions depuis l'API
  const [questionsPage, setQuestionsPage] = useState(1);
  const [questionsPerPage, setQuestionsPerPage] = useState(20);
  const [questionsTotal, setQuestionsTotal] = useState(0);
  const [questionsTotalPages, setQuestionsTotalPages] = useState(1);

  const loadQuestions = async (cert: CertificationType, mod: ModuleType) => {
    try {
      const params = new URLSearchParams();
      params.append('certification_type', cert);
      params.append('module', mod);
      params.append('page', String(questionsPage));
      params.append('per_page', String(questionsPerPage));
      const url = `${API_BASE}/admin/questions?${params.toString()}`;
      const res = await fetch(url, { 
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        } 
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Erreur lors du chargement des questions');
      }
      
      const data = await res.json();
      const list: any[] = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      
      // Trier les questions : publiées d'abord, puis par date de création
      const sortedList = [...list].sort((a, b) => {
        if (a.is_published !== b.is_published) {
          return a.is_published ? -1 : 1;
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
      
      setQuestions(sortedList.map(normalizeQuestionFromBackend));
      if (data?.pagination) {
        setQuestionsTotal(Number(data.pagination.total || 0));
        setQuestionsTotalPages(Number(data.pagination.last_page || 1));
      }
    } catch (error: unknown) {
      console.error('Erreur lors du chargement des questions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur inconnue est survenue';
      alert(errorMessage);
      setQuestions([]);
    }
  };

  useEffect(() => {
    if (activeSection === 'exam-questions') {
      loadQuestions(selectedCertification, selectedModule);
    }
  }, [activeSection, selectedCertification, selectedModule, questionsPage, questionsPerPage]);

  // Fonction pour publier un examen (API)
  const publishExam = async (certificationType: CertificationType, module: ModuleType) => {
    if (!window.confirm(`Voulez-vous vraiment publier l'examen pour la certification "${certificationType}" et le module "${module}" ? Les questions précédemment publiées pour ce module seront remplacées.`)) {
      return;
    }

    try {
      // Filtrer les questions correspondant à la certification et au module
      const questionsToPublish = questions.filter(
        q => q.certificationType === certificationType && 
             q.module === module
      );

      if (questionsToPublish.length === 0) {
        alert('Aucune question à publier pour cette certification et ce module');
        return;
      }

      const questionIds = questionsToPublish.map(q => q.id);
      
      const res = await fetch(`${API_BASE}/admin/exams/publish`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          certification_type: certificationType, 
          module,
          question_ids: questionIds
        })
      });
      
      const body = await res.json().catch(() => ({}));
      
      if (!res.ok) {
        throw new Error(body?.message || 'Erreur lors de la publication');
      }
      
      // Mettre à jour l'état local des questions
      const updatedQuestions = questions
        .filter((q): q is ExamQuestion & { id: string } => !!q.id) // Filtrer les questions sans ID
        .map(q => {
          if (q.certificationType === certificationType && q.module === module) {
            // Dépublier toutes les questions de ce module
            return { 
              ...q, 
              isPublished: false, 
              publishedAt: undefined // Utiliser undefined au lieu de null pour correspondre au type
            };
          }
          return q;
        })
        .map(q => 
          questionIds.includes(q.id) 
            ? { 
                ...q, 
                isPublished: true, 
                publishedAt: new Date().toISOString() 
              } 
            : q
        );
      
      setQuestions(updatedQuestions);
      
      // Recharger les questions pour s'assurer que tout est à jour
      await loadQuestions(selectedCertification, selectedModule);
      
      alert(`${body.published_count || questionIds.length} questions publiées avec succès pour le module ${module}`);
      
    } catch (e) {
      console.error('Erreur lors de la publication :', e);
      alert(`Erreur lors de la publication : ${e.message}`);
    }
  };

  // Fonction pour gérer la publication via la modale
  const handlePublishExam = async () => {
    try {
      // Récupérer les questions sélectionnées via les checkboxes
      const selectedQuestionIds = Array.from(
        document.querySelectorAll('input[type="checkbox"]:checked')
      ).map(input => {
        const id = input.id.replace('question-', '');
        return parseInt(id, 10);
      }).filter(id => !isNaN(id)); // S'assurer que tous les IDs sont des entiers valides
      
      console.log('IDs sélectionnés:', selectedQuestionIds);
      
      if (selectedQuestionIds.length === 0) {
        alert('Veuillez sélectionner au moins une question à publier.');
        return;
      }
      
      const response = await fetch(`${API_BASE}/admin/exams/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          certification_type: selectedCertification,
          module: selectedModule,
          question_ids: selectedQuestionIds
        })
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Erreur lors de la publication');
      }
      
      const result = await response.json();
      
      // Mettre à jour l'état local des questions
      const updatedQuestions = questions
        .filter((q): q is ExamQuestion & { id: string } => !!q.id)
        .map(q => {
          if (q.certificationType === selectedCertification && q.module === selectedModule) {
            // Dépublier toutes les questions de ce module
            return { 
              ...q, 
              isPublished: false, 
              publishedAt: undefined
            };
          }
          return q;
        })
        .map(q => 
          selectedQuestionIds.includes(parseInt(q.id)) 
            ? { 
                ...q, 
                isPublished: true, 
                publishedAt: new Date().toISOString() 
              } 
            : q
        );
      
      setQuestions(updatedQuestions);
      
      // Recharger les questions pour s'assurer que tout est à jour
      await loadQuestions(selectedCertification, selectedModule);
      
      alert(`Examen publié avec succès ! ${result.published_count} questions publiées.`);
      setShowPublishModal(false);
      
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert(`Erreur lors de la publication: ${error.message}`);
    }
  };
  
  // Fonction pour récupérer les soumissions d'un examinateur
  const getExaminerSubmissions = (examinerId: string) => {
    return examSubmissionsState
      .filter((submission: ExamSubmissionData) => 
        submission.examinerId === examinerId && 
        (submission.status === 'under_review' || submission.status === 'graded')
      )
      .map((submission: ExamSubmissionData) => {
        const candidate = users.find((u: User) => u.id === submission.candidateId);
        const examQuestions = questions.filter(
          (q: ExamQuestion) => q.certificationType === selectedExam?.certificationType && 
                             q.module === selectedExam?.module
        );
        const assignment = examAssignmentsState.find((a: ExamAssignment) => a.submissionId === submission.id);
        
        return {
          ...submission,
          candidate,
          questions: examQuestions,
          assignmentId: assignment?.id
        };
      });
  };
  
  // Fonction pour soumettre une correction
  const submitGrading = (submissionId: string, grades: Record<string, { score: number; feedback: string }>) => {
    const now = new Date().toISOString();
    
    // Update submission with grades
    setExamSubmissionsState((prev: ExamSubmissionData[]) => 
      prev.map((submission: ExamSubmissionData) => {
        if (submission.id === submissionId) {
          // Update examiner's assigned exams count if this submission has an examiner
          if (submission.examinerId) {
            setExaminers(prev =>
              prev.map(e =>
                e.id === submission.examinerId && e.assignedExams > 0
                  ? { ...e, assignedExams: e.assignedExams - 1 }
                  : e
              )
            );
          }
          
          // Calculate total score from grades
          const totalScore = Object.values(grades).reduce((sum, { score }) => sum + score, 0);
          
          // Generate certificate if score is sufficient (70% or higher)
          if (totalScore >= 70) {
            const candidate = users.find(u => u.id === submission.candidateId);
            if (candidate) {
              const newCertificate: Certificate = {
                id: `cert-${Date.now()}`,
                candidateName: `${candidate.firstName} ${candidate.lastName}`,
                certificationType: selectedExam?.certificationType || 'initiation_pratique_generale',
                module: selectedExam?.module || 'leadership',
                score: totalScore,
                issuedAt: now,
                downloadUrl: `/certificates/${candidate.id}-${Date.now()}.pdf`
              };
              setCertificates(prev => [...prev, newCertificate]);
            }
          }
          
          // Return updated submission with proper typing
          const updatedSubmission: ExamSubmissionData = {
            ...submission,
            status: 'graded',
            gradedAt: now,
            totalScore,
            answers: submission.answers.map(answer => {
              const grade = grades[answer.questionId];
              return {
                ...answer,
                score: grade?.score,
                feedback: grade?.feedback || ''
              };
            })
          };
          
          return updatedSubmission;
        }
        return submission;
      })
    );
    
    alert('Correction soumise avec succès.');
  };

  const [certificates, setCertificates] = useState<Certificate[]>([
    {
      id: '1',
      candidateName: 'Marie Dubois',
      score: 85,
      issuedAt: '2024-01-16',
      downloadUrl: '/certificates/marie-dubois.pdf'
    }
  ]);

  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'candidate' as 'admin' | 'examiner' | 'candidate',
    profession: '',
    specialization: '',
    experience: '',
    password: '',
    passwordConfirm: ''
  });

  // Examiner form state
  const [examinerForm, setExaminerForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    specialization: '',
    experience: ''
  });

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u: User) => u.isActive).length,
    totalExaminers: examiners.length,
    activeExaminers: examiners.filter((e: Examiner) => e.isActive).length,
    pendingExams: examSubmissionsState.filter((e: ExamSubmissionData) => e.status === 'submitted').length,
    completedExams: examSubmissionsState.filter((e: ExamSubmissionData) => e.status === 'graded').length,
    totalPayments: payments.reduce((sum: number, p: Payment) => sum + p.amount, 0),
    completedPayments: payments.filter((p: Payment) => p.status === 'completed').length,
    totalCertificates: certificates.length
  };

  // Filter users based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) || 
      (statusFilter === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  // User Modal Functions
  const openUserModal = (mode: 'create' | 'edit' | 'view', user?: User) => {
    setModalMode(mode);
    setSelectedUser(user || null);
    if (user) {
      setUserForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profession: user.profession || '',
        specialization: user.specialization || '',
        experience: user.experience || '',
        password: '',
        passwordConfirm: ''
      });
    } else {
      setUserForm({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        role: 'admin',
        profession: '',
        specialization: '',
        experience: '',
        password: '',
        passwordConfirm: ''
      });
    }
    setShowUserModal(true);
  };

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const saveUser = async () => {
    setError(null);
    setFieldErrors({});
    
    try {
      // Validation côté client
      const errors: Record<string, string[]> = {};
      
      if (!userForm.firstName) errors.firstName = ['Le prénom est obligatoire'];
      if (!userForm.lastName) errors.lastName = ['Le nom est obligatoire'];
      
      if (!userForm.email) {
        errors.email = ['L\'email est obligatoire'];
      } else if (!/\S+@\S+\.\S+/.test(userForm.email)) {
        errors.email = ['Format d\'email invalide'];
      }
      
      if (!userForm.phone) {
        errors.phone = ['Le téléphone est obligatoire'];
      }
      
      if (modalMode === 'create') {
        if (!userForm.password) {
          errors.password = ['Le mot de passe est obligatoire'];
        } else if (userForm.password.length < 6) {
          errors.password = ['Le mot de passe doit contenir au moins 6 caractères'];
        }
        
        if (userForm.password !== userForm.passwordConfirm) {
          errors.passwordConfirm = ['Les mots de passe ne correspondent pas'];
        }
      }
      
      // Si erreurs de validation côté client
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Veuillez corriger les erreurs dans le formulaire');
        return;
      }

      // Préparation du payload
      const payload: Record<string, any> = {
        first_name: userForm.firstName,
        last_name: userForm.lastName,
        email: userForm.email,
        phone: userForm.phone,
        role: 'admin', // Toujours définir le rôle comme admin pour ce formulaire
      };

      // Ajouter les champs optionnels s'ils ont une valeur
      if (userForm.profession) {
        payload.profession = userForm.profession;
      }

      // Ajout des champs spécifiques à la création
      if (modalMode === 'create') {
        payload.password = userForm.password;
        payload.password_confirmation = userForm.passwordConfirm;
        
        const res = await fetch(`${API_BASE}/admin/users/create-admin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 422 && data.errors) {
            // Gestion des erreurs de validation du serveur
            const serverErrors: Record<string, string[]> = {};
            Object.keys(data.errors).forEach(key => {
              // Convertir les clés du backend (snake_case) en camelCase pour le frontend
              const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
              serverErrors[camelKey] = data.errors[key];
            });
            setFieldErrors(serverErrors);
            setError('Veuillez corriger les erreurs dans le formulaire');
            return;
          }
          throw new Error(data.message || data.error || 'Erreur lors de la création de l\'administrateur');
        }

        // Si succès, recharger la liste et fermer le modal
        await loadUsers();
        closeUserModal();
        toast.success('Administrateur créé avec succès');
      } else if (modalMode === 'edit' && selectedUser) {
        const res = await fetch(`${API_BASE}/admin/users/${selectedUser.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 422 && data.errors) {
            const serverErrors: Record<string, string[]> = {};
            Object.keys(data.errors).forEach(key => {
              const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
              serverErrors[camelKey] = data.errors[key];
            });
            setFieldErrors(serverErrors);
            setError('Veuillez corriger les erreurs dans le formulaire');
            return;
          }
          throw new Error(data.message || data.error || 'Erreur lors de la mise à jour de l\'utilisateur');
        }

        // Si succès, recharger la liste et fermer le modal
        await loadUsers();
        closeUserModal();
        toast.success('Utilisateur mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la communication avec le serveur';
      setError(errorMessage);
      // Ne pas fermer le modal en cas d'erreur
    }
  };

  const deleteUser = async (userId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Erreur lors de la suppression de l\'utilisateur');
      }
      
      // Recharger la liste des utilisateurs après la suppression
      await loadUsers();
      
      // Afficher un message de succès
      if (typeof toast !== 'undefined') {
        toast.success('Utilisateur supprimé avec succès');
      } else {
        alert('Utilisateur supprimé avec succès');
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', error);
      let errorMessage = 'Une erreur est survenue lors de la suppression';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message);
      }
      
      // Vérifier si c'est une erreur de violation de clé étrangère
      if (errorMessage.includes('foreign key constraint')) {
        errorMessage = 'Impossible de supprimer cet utilisateur car il est lié à d\'autres données dans le système.';
      }
      
      if (typeof toast !== 'undefined') {
        toast.error(errorMessage);
      } else {
        alert(`Erreur : ${errorMessage}`);
      }
    }
  };

  const toggleUserStatus = async (userId: string) => {
    const current = users.find(u => u.id === userId);
    const is_active = current ? !current.isActive : true;
    await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ is_active })
    });
    await loadUsers();
  };

  // Examiner Modal Functions
  const openExaminerModal = (mode: 'create' | 'edit', examiner?: Examiner) => {
    setModalMode(mode);
    setSelectedExaminer(examiner || null);
    if (examiner) {
      setExaminerForm({
        firstName: examiner.firstName,
        lastName: examiner.lastName,
        email: examiner.email,
        phone: examiner.phone,
        specialization: examiner.specialization,
        experience: examiner.experience,
        password: '', // Ne pas afficher le mot de passe existant pour des raisons de sécurité
        passwordConfirm: ''
      });
    } else {
      setExaminerForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        phone: '',
        specialization: '',
        experience: ''
      });
    }
    setShowExaminerModal(true);
  };

  const closeExaminerModal = () => {
    setShowExaminerModal(false);
    setSelectedExaminer(null);
  };

  const saveExaminer = async () => {
    setError(null);
    setFieldErrors({});
    
    try {
      // Validation côté client
      const errors: Record<string, string[]> = {};
      
      if (!examinerForm.firstName) errors.firstName = ['Le prénom est obligatoire'];
      if (!examinerForm.lastName) errors.lastName = ['Le nom est obligatoire'];
      
      if (!examinerForm.email) {
        errors.email = ['L\'email est obligatoire'];
      } else if (!/\S+@\S+\.\S+/.test(examinerForm.email)) {
        errors.email = ['Format d\'email invalide'];
      }
      
      if (!examinerForm.phone) {
        errors.phone = ['Le téléphone est obligatoire'];
      }
      
      if (!examinerForm.specialization) {
        errors.specialization = ['La spécialisation est obligatoire'];
      }
      
      if (modalMode === 'create') {
        if (!examinerForm.password) {
          errors.password = ['Le mot de passe est obligatoire'];
        } else if (examinerForm.password.length < 6) {
          errors.password = ['Le mot de passe doit contenir au moins 6 caractères'];
        }
        
        if (examinerForm.password !== examinerForm.passwordConfirm) {
          errors.passwordConfirm = ['Les mots de passe ne correspondent pas'];
        }
      }
      
      // Si erreurs de validation côté client
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        setError('Veuillez corriger les erreurs dans le formulaire');
        return;
      }
      
      if (modalMode === 'create') {
        const payload = {
          first_name: examinerForm.firstName,
          last_name: examinerForm.lastName,
          email: examinerForm.email,
          phone: examinerForm.phone,
          specialization: examinerForm.specialization || '',
          experience: examinerForm.experience || null,
          password: examinerForm.password,
          password_confirmation: examinerForm.passwordConfirm
        };
        
        const res = await fetch(`${API_BASE}/admin/users/create-examiner`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 422 && data.errors) {
            // Gestion des erreurs de validation du serveur
            const serverErrors: Record<string, string[]> = {};
            Object.keys(data.errors).forEach(key => {
              // Convertir les clés du backend (snake_case) en camelCase pour le frontend
              const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
              serverErrors[camelKey] = data.errors[key];
            });
            setFieldErrors(serverErrors);
            
            // Message d'erreur spécifique pour l'email déjà utilisé
            if (data.errors.email && (data.errors.email.includes('déjà utilisé') || data.errors.email.includes('already been taken'))) {
              setError('Cette adresse email est déjà utilisée. Veuillez en choisir une autre.');
            } else {
              setError('Veuillez corriger les erreurs dans le formulaire');
            }
            return;
          }
          throw new Error(data.message || data.error || 'Erreur lors de la création de l\'examinateur');
        }
        
        // Si succès, recharger la liste et fermer le modal
        await loadUsers();
        closeExaminerModal();
        toast.success('Examinateur créé avec succès');
      } else if (modalMode === 'edit' && selectedExaminer) {
        const payload = {
          first_name: examinerForm.firstName,
          last_name: examinerForm.lastName,
          email: examinerForm.email,
          phone: examinerForm.phone,
          specialization: examinerForm.specialization || '',
          experience: examinerForm.experience || ''
        };
        
        const res = await fetch(`${API_BASE}/admin/users/${selectedExaminer.id}`, {
          method: 'PATCH',
          headers: { 
            'Content-Type': 'application/json', 
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          if (res.status === 422 && data.errors) {
            const serverErrors: Record<string, string[]> = {};
            Object.keys(data.errors).forEach(key => {
              const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
              serverErrors[camelKey] = data.errors[key];
            });
            setFieldErrors(serverErrors);
            setError('Veuillez corriger les erreurs dans le formulaire');
            return;
          }
          throw new Error(data.message || data.error || 'Erreur lors de la mise à jour de l\'examinateur');
        }
        
        // Si succès, recharger la liste et fermer le modal
        await loadUsers();
        closeExaminerModal();
        toast.success('Examinateur mis à jour avec succès');
      }
    } catch (error) {
      console.error('Erreur:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la communication avec le serveur';
      setError(errorMessage);
    }
  };

  const toggleExaminerStatus = async (examinerId: string) => {
    try {
      const current = users.find(u => u.id === examinerId);
      if (!current) {
        console.error('Examinateur non trouvé');
        return;
      }
      
      const isActive = !current.isActive;
      const res = await fetch(`${API_BASE}/admin/users/${examinerId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ is_active: isActive })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error || 'Erreur lors de la mise à jour du statut');
      }
      
      // Recharger la liste des utilisateurs
      await loadUsers();
      toast.success(`Examinateur ${isActive ? 'activé' : 'désactivé'} avec succès`);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const sendEmailToExaminer = (examiner: Examiner) => {
    console.log('Email envoyé à:', examiner.email);
  };

  // Fonction pour assigner un examinateur à une soumission
  const assignExaminer = async (submissionId: string, examinerId: string) => {
    try {
      const response = await AdminService.assignExaminer(submissionId, examinerId);
      
      if (response.success) {
        // Mettre à jour l'état local
        setExamSubmissionsState(prev => 
          prev.map(s => 
            s.id === submissionId 
              ? { ...s, examinerId, status: 'under_review' as const }
              : s
          )
        );

        // Mettre à jour le compteur d'examens assignés de l'examinateur
        setExaminers(prev => 
          prev.map(e => 
            e.id === examinerId 
              ? { ...e, assignedExams: (e.assignedExams || 0) + 1 }
              : e
          )
        );
        
        toast.success('Examinateur assigné avec succès');
      } else {
        toast.error('Erreur lors de l\'assignation de l\'examinateur');
      }
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
      toast.error('Erreur lors de l\'assignation de l\'examinateur');
    }
  };

  const downloadCertificate = (certificate: Certificate) => {
    console.log('Téléchargement du certificat:', certificate.downloadUrl);
    alert(`Téléchargement du certificat de ${certificate.candidateName}`);
  };

  const sendCertificateByEmail = (certificate: Certificate) => {
    console.log('Certificat envoyé par email:', certificate.candidateName);
    alert(`Certificat envoyé par email à ${certificate.candidateName}`);
  };

  // Fonctions pour la gestion des questions d'examen
  const handleQuestionChange = (field: keyof ExamQuestion, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAnswerOptionChange = (id: string, field: keyof AnswerOption, value: any) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: prev.answerOptions?.map(option => 
        option.id === id ? { ...option, [field]: value } : option
      )
    }));
  };

  const addAnswerOption = () => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: [
        ...(prev.answerOptions || []),
        { id: Date.now().toString(), text: '', isCorrect: false }
      ]
    }));
  };

  const removeAnswerOption = (id: string) => {
    setCurrentQuestion(prev => ({
      ...prev,
      answerOptions: prev.answerOptions?.filter(option => option.id !== id)
    }));
  };

  const saveQuestion = async () => {
    // Validation de base
    if (!currentQuestion.questionText || !currentQuestion.referenceAnswer) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Vérification des options QCM
    if (currentQuestion.questionType === 'qcm' && currentQuestion.answerOptions) {
      const hasCorrectAnswer = currentQuestion.answerOptions.some(opt => opt.isCorrect);
      if (!hasCorrectAnswer) {
        alert('Veuillez sélectionner au moins une réponse correcte pour le QCM');
        return;
      }
    }

    // Préparation des données avec conversion explicite des types
    const payload: any = {
      certification_type: selectedCertification,
      module: selectedModule,
      question_type: currentQuestion.questionType || 'qcm',
      question_text: String(currentQuestion.questionText || ''),
      reference_answer: String(currentQuestion.referenceAnswer || ''),
      instructions: String(currentQuestion.instructions || ''),
      points: Number(currentQuestion.points) || 1,
      time_limit: Number(currentQuestion.timeLimit) || 60,
      is_required: currentQuestion.isRequired !== false,
    };

    // Gestion des options QCM si nécessaire
    if (currentQuestion.questionType === 'qcm' && currentQuestion.answerOptions) {
      payload.answer_options = currentQuestion.answerOptions.map(opt => ({
        id: String(opt.id || Date.now().toString()),
        text: String(opt.text || ''),
        isCorrect: Boolean(opt.isCorrect)
      }));
    }

    console.log('Données envoyées :', JSON.stringify(payload, null, 2));

    try {
      const res = await fetch(`${API_BASE}/admin/questions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const responseText = await res.text();
      console.log('Statut de la réponse :', res.status);
      console.log('Corps de la réponse :', responseText);
      
      let body;
      try {
        body = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error('Échec de l\'analyse de la réponse JSON :', responseText);
        throw new Error('Réponse JSON invalide du serveur');
      }
      
      if (!res.ok) {
        const errorMsg = body?.message || 
                        (body?.errors ? JSON.stringify(body.errors) : `Erreur HTTP ! statut : ${res.status}`);
        throw new Error(errorMsg);
      }
      
      // Succès - recharger les questions et réinitialiser le formulaire
      await loadQuestions(selectedCertification, selectedModule);
      setCurrentQuestion({
        questionType: 'qcm',
        isRequired: true,
        points: 1,
        timeLimit: 60,
        answerOptions: [
          { id: '1', text: '', isCorrect: false },
          { id: '2', text: '', isCorrect: false }
        ]
      });
      alert('Question enregistrée avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement :', error);
      alert(`Erreur lors de l'enregistrement de la question : ${error.message}`);
    }
  };

  const deleteQuestion = async (id: string | undefined) => {
    if (!id) {
      console.error('Tentative de suppression d\'une question sans ID');
      return;
    }
    
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;
    
    try {
      const res = await fetch(`${API_BASE}/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${getToken()}`,
          'Accept': 'application/json'
        }
      });
      
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || 'Erreur lors de la suppression de la question');
      }
      
      // Recharger les questions si les sélections sont définies
      if (selectedCertification && selectedModule) {
        await loadQuestions(selectedCertification, selectedModule);
      } else {
        // Sinon, filtrer la question supprimée de l'état local
        setQuestions(prev => prev.filter(q => q.id === id ? false : true));
      }
      
      alert('Question supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la question:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    }
  };

  const certificationLabels: Record<CertificationType, string> = {
    initiation_pratique_generale: 'Certification d\'Initiation Pratique Générale',
    cadre_manager_professionnel: 'Certification Cadre, Manager et Professionnel d\'entreprise',
    rentabilite_entrepreneuriale: 'Certification en Rentabilité Entrepreneuriale',
    chef_dirigeant_entreprise_africaine: 'Certification Chef ou Dirigeant d\'Entreprise Locale Africaine',
    investisseur_entreprises_africaines: 'Certification Investisseur en Entreprises Africaines',
    ingenieries_specifiques: 'Certifications en Ingénieries Spécifiques'
  };

  const moduleLabels: Record<ModuleType, string> = {
    leadership: 'Module Leadership',
    competences_professionnelles: 'Module Compétences Professionnelles',
    entrepreneuriat: 'Module Entrepreneuriat'
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!user || user.role !== 'admin') return null;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'examiners', label: 'Examinateurs', icon: UserCheck },
    { id: 'exams', label: 'Examens', icon: FileText },
    { id: 'payments', label: 'Paiements', icon: CreditCard },
    { id: 'certificates', label: 'Certificats', icon: Award },
    { id: 'analytics', label: 'Analytiques', icon: BarChart2 },
    { id: 'settings', label: 'Paramètres', icon: Settings },
    { id: 'exam-questions', label: 'Questions d\'examen', icon: HelpCircle }
  ];

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex-shrink-0">
        <div className="p-6">
          <h2 className="text-xl font-bold">Leadership Admin</h2>
          <p className="text-gray-400 text-sm">Panneau d'administration</p>
        </div>
        
        <nav className="mt-6">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                  activeSection === item.id ? 'bg-gray-800 border-r-2 border-blue-500' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {sidebarItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {(user.firstName || '').charAt(0) || '?'}{(user.lastName || '').charAt(0) || ''}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <BarChart2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalUsers}</p>
                      <p className="text-sm text-gray-500">{stats.activeUsers} actifs</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Examinateurs</h3>
                      <p className="text-2xl font-bold text-green-600">{stats.totalExaminers}</p>
                      <p className="text-sm text-gray-500">{stats.activeExaminers} actifs</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <FileText className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Examens</h3>
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingExams}</p>
                      <p className="text-sm text-gray-500">en attente</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Revenus</h3>
                      <p className="text-2xl font-bold text-purple-600">{formatPrice(stats.totalPayments)}</p>
                      <p className="text-sm text-gray-500">{stats.completedPayments} paiements</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Activité Récente</h3>
                    <button 
                      onClick={loadRecentActivities} 
                      disabled={loadingActivities}
                      className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    >
                      {loadingActivities ? 'Chargement...' : 'Rafraîchir'}
                    </button>
                  </div>
                  <div className="space-y-3">
                    {loadingActivities ? (
                      <div className="flex justify-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : recentActivities.length > 0 ? (
                      recentActivities.map((activity) => {
                        // Déterminer l'icône et la couleur en fonction du type d'activité
                        let icon = null;
                        let bgColor = 'bg-gray-50';
                        let iconColor = 'text-gray-600';

                        switch (activity.type) {
                          case 'user_registered':
                            icon = <UserPlus className="h-5 w-5" />;
                            bgColor = 'bg-blue-50';
                            iconColor = 'text-blue-600';
                            break;
                          case 'payment_confirmed':
                            icon = <CheckCircle className="h-5 w-5" />;
                            bgColor = 'bg-green-50';
                            iconColor = 'text-green-600';
                            break;
                          case 'exam_submitted':
                            icon = <FileText className="h-5 w-5" />;
                            bgColor = 'bg-orange-50';
                            iconColor = 'text-orange-600';
                            break;
                          default:
                            icon = <Clock className="h-5 w-5" />;
                            bgColor = 'bg-gray-50';
                            iconColor = 'text-gray-600';
                        }

                        return (
                          <div 
                            key={activity.id} 
                            className={`flex items-center space-x-3 p-3 ${bgColor} rounded-lg`}
                          >
                            <div className={iconColor}>
                              {icon}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{activity.description}</p>
                              <p className="text-xs text-gray-500">
                                {activity.user ? `${activity.user.name} - ` : ''}
                                {activity.created_at}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        Aucune activité récente
                      </div>
                    )}
                  </div>
                </Card>

                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions Rapides</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => openUserModal('create')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Créer un administrateur
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => openExaminerModal('create')}
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Ajouter un examinateur
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="secondary"
                      onClick={() => setActiveSection('exams')}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Gérer les examens
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Header with Search and Actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher un utilisateur..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs</option>
                    <option value="inactive">Inactifs</option>
                  </select>
                </div>
                <Button onClick={() => openUserModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel administrateur
                </Button>
              </div>

              {/* Users Table */}
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Utilisateur</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Email</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Rôle</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date création</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-500">{user.phone}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{user.email}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                              user.role === 'examiner' ? 'bg-green-100 text-green-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : user.role === 'examiner' ? 'Examinateur' : 'Candidat'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(user.createdAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => openUserModal('view', user)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                                title="Voir"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openUserModal('edit', user)}
                                className="p-1 text-gray-400 hover:text-green-600"
                                title="Modifier"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => toggleUserStatus(user.id)}
                                className={`p-1 ${user.isActive ? 'text-gray-400 hover:text-red-600' : 'text-gray-400 hover:text-green-600'}`}
                                title={user.isActive ? 'Désactiver' : 'Activer'}
                              >
                                {user.isActive ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  currentPage={usersPage}
                  totalPages={usersTotalPages}
                  perPage={usersPerPage}
                  totalItems={usersTotal}
                  onPageChange={(p) => setUsersPage(p)}
                  onPerPageChange={(pp) => { setUsersPerPage(pp); setUsersPage(1); }}
                />
              </Card>
            </div>
          )}

          {activeSection === 'examiners' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">Gestion des Examinateurs</h2>
                <Button onClick={() => openExaminerModal('create')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel examinateur
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {examiners.map((examiner) => (
                  <Card key={examiner.id}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {examiner.firstName} {examiner.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{examiner.email}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        examiner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {examiner.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm"><span className="font-medium">Spécialisation:</span> {examiner.specialization}</p>
                      <p className="text-sm"><span className="font-medium">Expérience:</span> {examiner.experience}</p>
                      <p className="text-sm"><span className="font-medium">Examens assignés:</span> {examiner.assignedExams}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openExaminerModal('edit', examiner)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => sendEmailToExaminer(examiner)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={examiner.isActive ? "danger" : "success"}
                        onClick={() => toggleExaminerStatus(examiner.id)}
                      >
                        {examiner.isActive ? <AlertCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              <Pagination
                currentPage={examinersPage}
                totalPages={examinersTotalPages}
                perPage={examinersPerPage}
                totalItems={examinersTotal}
                onPageChange={(p) => setExaminersPage(p)}
                onPerPageChange={(pp) => { setExaminersPerPage(pp); setExaminersPage(1); }}
              />
            </div>
          )}

          {activeSection === 'exam-questions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Gestion des questions d'examen</h2>
                <div>
                  <Button
                    onClick={() => {
                      console.log('=== DÉBOGAGE PUBLICATION ===');
                      console.log('Toutes les questions:', questions);
                      console.log('Sélection courante:', { selectedCertification, selectedModule });
                      const filteredQuestions = questions.filter(
                        q => q.certificationType === selectedCertification && 
                             q.module === selectedModule
                      );
                      console.log('Questions filtrées:', filteredQuestions);
                      console.log('IDs des questions filtrées:', filteredQuestions.map(q => ({ id: q.id, type: typeof q.id })));
                      console.log('Nombre de questions correspondantes:', filteredQuestions.length);
                      console.log('=== FIN DÉBOGAGE ===');
                      setShowPublishModal(true);
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                    disabled={questions.filter(
                      q => q.certificationType === selectedCertification && 
                           q.module === selectedModule
                    ).length === 0}
                  >
                    Publier l'examen
                  </Button>
                  <button 
                    onClick={() => {
                      console.log('=== ÉTAT ACTUEL ===');
                      console.log('Questions:', questions);
                      console.log('Sélection courante:', { selectedCertification, selectedModule });
                      console.log('Questions filtrées:', questions.filter(
                        q => q.certificationType === selectedCertification && 
                             q.module === selectedModule
                      ));
                      console.log('==================');
                    }}
                    className="ml-2 text-xs text-gray-500"
                  >
                    (Déboguer)
                  </button>
                </div>
              </div>

              {/* Sélection de la certification et du module */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Contexte de la question</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Certification
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedCertification}
                      onChange={(e) => setSelectedCertification(e.target.value as CertificationType)}
                    >
                      {Object.entries(certificationLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Module
                    </label>
                    <select
                      className="w-full p-2 border border-gray-300 rounded-md"
                      value={selectedModule}
                      onChange={(e) => setSelectedModule(e.target.value as ModuleType)}
                    >
                      {Object.entries(moduleLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </Card>

              {/* Formulaire de création de question */}
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Nouvelle question</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de question
                    </label>
                    <div className="flex space-x-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={currentQuestion.questionType === 'qcm'}
                          onChange={() => handleQuestionChange('questionType', 'qcm')}
                        />
                        <span className="ml-2">QCM</span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio"
                          checked={currentQuestion.questionType === 'free_text'}
                          onChange={() => handleQuestionChange('questionType', 'free_text')}
                        />
                        <span className="ml-2">Question libre</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={currentQuestion.questionText || ''}
                      onChange={(e) => handleQuestionChange('questionText', e.target.value)}
                      placeholder="Écrivez votre question ici..."
                    />
                  </div>

                  {currentQuestion.questionType === 'qcm' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options de réponse
                      </label>
                      <div className="space-y-2 mb-2">
                        {currentQuestion.answerOptions?.map((option) => (
                          <div key={option.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={option.isCorrect}
                              onChange={(e) => 
                                handleAnswerOptionChange(option.id, 'isCorrect', e.target.checked)
                              }
                              className="form-checkbox h-5 w-5 text-blue-600"
                            />
                            <input
                              type="text"
                              className="flex-1 p-2 border border-gray-300 rounded-md"
                              value={option.text}
                              onChange={(e) => 
                                handleAnswerOptionChange(option.id, 'text', e.target.value)
                              }
                              placeholder="Texte de l'option"
                            />
                            <button
                              type="button"
                              onClick={() => removeAnswerOption(option.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addAnswerOption}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" /> Ajouter une option
                      </button>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Réponse de référence <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={3}
                      value={currentQuestion.referenceAnswer || ''}
                      onChange={(e) => handleQuestionChange('referenceAnswer', e.target.value)}
                      placeholder="Réponse attendue..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions supplémentaires
                    </label>
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md"
                      rows={2}
                      value={currentQuestion.instructions || ''}
                      onChange={(e) => handleQuestionChange('instructions', e.target.value)}
                      placeholder="Instructions pour l'examinateur..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points
                      </label>
                      <input
                        type="number"
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentQuestion.points || 1}
                        onChange={(e) => handleQuestionChange('points', parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Durée (secondes)
                      </label>
                      <input
                        type="number"
                        min="10"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={currentQuestion.timeLimit || 60}
                        onChange={(e) => handleQuestionChange('timeLimit', parseInt(e.target.value) || 60)}
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={currentQuestion.isRequired !== false}
                          onChange={(e) => handleQuestionChange('isRequired', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Question obligatoire</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      onClick={saveQuestion}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Enregistrer la question
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Liste des questions existantes */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Questions existantes</h3>
                
                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Aucune question n'a été créée pour le moment.</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question) => (
                      <div key={question.id} className={`border rounded-lg p-4 mb-4 ${question.isPublished ? 'border-green-200 bg-green-50' : ''}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium">{question.questionText}</h3>
                              {question.isPublished && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Publiée
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {question.questionType === 'qcm' ? 'QCM' : 'Réponse libre'} • {question.points} points • {question.timeLimit} sec
                              {(() => {
                                // Vérifier explicitement que publishedAt est une chaîne non vide
                                if (typeof question.publishedAt === 'string' && question.publishedAt.trim() !== '') {
                                  try {
                                    const date = new Date(question.publishedAt);
                                    if (!isNaN(date.getTime())) {
                                      return (
                                        <span className="ml-2 text-xs text-gray-500">
                                          (publiée le {date.toLocaleDateString()})
                                        </span>
                                      );
                                    }
                                  } catch (e) {
                                    console.error('Erreur de format de date:', question.publishedAt, e);
                                  }
                                }
                                return null;
                              })()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              type="button"
                              className="text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                // Mettre à jour avec la question existante
                                setCurrentQuestion({
                                  ...question,
                                  answerOptions: question.answerOptions?.length ? question.answerOptions : [
                                    { id: '1', text: '', isCorrect: false },
                                    { id: '2', text: '', isCorrect: false }
                                  ]
                                });
                                // Supprimer l'ancienne version
                                setQuestions(prev => prev.filter(q => q.id !== question.id));
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => {
                                if (!question.id) {
                                  console.error('Impossible de supprimer une question sans ID');
                                  return;
                                }
                                deleteQuestion(question.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Pagination
                  currentPage={questionsPage}
                  totalPages={questionsTotalPages}
                  perPage={questionsPerPage}
                  totalItems={questionsTotal}
                  onPageChange={(p) => setQuestionsPage(p)}
                  onPerPageChange={(pp) => { setQuestionsPerPage(pp); setQuestionsPage(1); }}
                />
              </Card>
            </div>
          )}

          {activeSection === 'exams' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Examens</h2>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Soumissions d'examens par candidat</h3>
                <div className="space-y-4">
                  {(() => {
                    // Grouper les soumissions par candidat + certification
                    const groupedByCandidateAndCert = examSubmissionsState.reduce((acc, submission) => {
                      const candidateId = submission.candidateId;
                      
                      // Extraire la certification de l'exam_id
                      const certMatch = submission.examId.match(/^exam-(.*?)-/);
                      const certification = certMatch ? certMatch[1] : 'unknown';
                      
                      const key = `${candidateId}-${certification}`;
                      
                      if (!acc[key]) {
                        acc[key] = {
                          candidateId,
                          candidateName: submission.candidateName,
                          candidateEmail: users.find(u => u.id === submission.candidateId)?.email || 'Email non disponible',
                          certification,
                          submissions: [],
                          latestSubmissionDate: submission.submittedAt,
                          status: submission.status,
                          examinerId: submission.examinerId
                        };
                      }
                      acc[key].submissions.push(submission);
                      
                      // Mettre à jour la date la plus récente
                      if (submission.submittedAt && new Date(submission.submittedAt) > new Date(acc[key].latestSubmissionDate)) {
                        acc[key].latestSubmissionDate = submission.submittedAt;
                      }
                      
                      // Mettre à jour le statut (priorité: under_review > submitted > graded)
                      if (submission.status === 'under_review' || 
                          (submission.status === 'submitted' && acc[key].status !== 'under_review') ||
                          (submission.status === 'graded' && acc[key].status !== 'under_review' && acc[key].status !== 'submitted')) {
                        acc[key].status = submission.status;
                        acc[key].examinerId = submission.examinerId;
                      }
                      
                      return acc;
                    }, {} as Record<string, any>);

                    return Object.values(groupedByCandidateAndCert).map((candidateCert: any) => {
                      // Formater le nom de la certification
                      const certificationName = candidateCert.certification
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (l: string) => l.toUpperCase());
                      
                      return (
                        <div key={`${candidateCert.candidateId}-${candidateCert.certification}`} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-lg">
                                {candidateCert.candidateName}
                              </h4>
                              <p className="text-sm text-gray-500">{candidateCert.candidateEmail}</p>
                              <p className="text-xs text-blue-600 font-medium">
                                Certification: {certificationName}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Dernière soumission: {formatDate(candidateCert.latestSubmissionDate)}
                              </p>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                candidateCert.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                candidateCert.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                candidateCert.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {candidateCert.status === 'draft' ? 'Brouillon' :
                                 candidateCert.status === 'submitted' ? 'Soumis' :
                                 candidateCert.status === 'under_review' ? 'En correction' :
                                 'Corrigé'}
                              </span>
                            </div>
                          </div>
                          
                          {/* Afficher les modules de cette certification */}
                          <div className="mb-4">
                            <h5 className="text-sm font-medium text-gray-700 mb-2">
                              Modules soumis ({candidateCert.submissions.length}):
                            </h5>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {candidateCert.submissions.map((submission: any) => {
                                // Extraire le module de l'exam_id
                                const moduleMatch = submission.examId.match(/exam-.*?-(.*?)$/);
                                const moduleName = moduleMatch ? moduleMatch[1].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) : 'Module inconnu';
                                
                                return (
                                  <div key={submission.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-700">{moduleName}</span>
                                    <span className={`px-2 py-1 text-xs rounded ${
                                      submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                                      submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {submission.status === 'graded' ? 'Corrigé' :
                                       submission.status === 'under_review' ? 'En cours' :
                                       'Soumis'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              {candidateCert.examinerId ? (
                                <span>Assigné à: <strong>
                                  {examiners.find(e => e.id === candidateCert.examinerId)?.firstName} {examiners.find(e => e.id === candidateCert.examinerId)?.lastName}
                                </strong></span>
                              ) : (
                                <span className="text-orange-600">Non assigné</span>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                className="text-blue-600 hover:text-blue-800"
                                onClick={() => {
                                  setCurrentExamSubmission(candidateCert.submissions[0]);
                                  setShowSubmissionModal(true);
                                }}
                                title="Voir les détails"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              
                              {candidateCert.status === 'submitted' && (
                                <select
                                  value={candidateCert.examinerId || ''}
                                  onChange={(e) => {
                                    const examinerId = e.target.value;
                                    if (examinerId) {
                                      // Assigner TOUS les modules de cette certification au même examinateur
                                      candidateCert.submissions.forEach((submission: any) => {
                                        assignExaminer(submission.id, examinerId);
                                      });
                                    }
                                  }}
                                  className="text-xs border rounded p-1"
                                  title="Assigner un examinateur pour tous les modules de cette certification"
                                >
                                  <option value="">Assigner...</option>
                                  {examiners
                                    .filter(e => e.isActive)
                                    .map(examiner => (
                                      <option key={examiner.id} value={examiner.id}>
                                        {examiner.firstName[0]}. {examiner.lastName}
                                      </option>
                                    ))}
                                </select>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                  
                  {examSubmissionsState.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      Aucune soumission d'examen trouvée
                    </div>
                  )}
                <Pagination
                  currentPage={submissionsPage}
                  totalPages={submissionsTotalPages}
                  perPage={submissionsPerPage}
                  totalItems={submissionsTotal}
                  onPageChange={(p) => setSubmissionsPage(p)}
                  onPerPageChange={(pp) => { setSubmissionsPerPage(pp); setSubmissionsPage(1); }}
                />
                </div>
              </Card>
            </div>
          )}

          {/* Modal de soumission d'examen */}
          {showSubmissionModal && currentExamSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Soumission de {currentExamSubmission.candidateName}
                    </h3>
                    <button 
                      onClick={() => setShowSubmissionModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {currentExamSubmission.answers.map((answer, index) => {
                      const question = questions.find(q => q.id === answer.questionId);
                      if (!question) return null;
                      
                      return (
                        <div key={answer.questionId} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">
                            Question {index + 1}: {question.questionText}
                          </h4>
                          <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-sm text-gray-700 mb-1">Réponse du candidat:</p>
                            <p className="whitespace-pre-wrap">
                              {Array.isArray(answer.answer) 
                                ? answer.answer.join(', ')
                                : answer.answer || 'Aucune réponse fournie'}
                            </p>
                          </div>
                          {answer.score !== undefined && (
                            <div className="mt-2">
                              <p className="text-sm font-medium">
                                Note: {answer.score} / 20
                              </p>
                              {answer.feedback && (
                                <div className="mt-1 text-sm text-gray-600">
                                  <p className="font-medium">Commentaire:</p>
                                  <p>{answer.feedback}</p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowSubmissionModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Fermer
                    </button>
                    {currentExamSubmission.status !== 'graded' && (
                      <button
                        onClick={() => {
                          setShowSubmissionModal(false);
                          setShowGradingModal(true);
                        }}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                      >
                        {currentExamSubmission.status === 'under_review' 
                          ? 'Continuer la correction' 
                          : 'Commencer la correction'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Modal de correction */}
          {showGradingModal && currentExamSubmission && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Correction de {currentExamSubmission.candidateName}
                    </h3>
                    <button 
                      onClick={() => {
                        setShowGradingModal(false);
                        setGrades({});
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    submitGrading(currentExamSubmission.id, grades);
                    setShowGradingModal(false);
                    setGrades({});
                  }}>
                    <div className="space-y-6">
                      {currentExamSubmission.answers.map((answer, index) => {
                        const question = questions.find(q => q.id === answer.questionId);
                        if (!question) return null;
                        
                        return (
                          <div key={answer.questionId} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2">
                              Question {index + 1}: {question.questionText}
                            </h4>
                            <div className="bg-gray-50 p-3 rounded-md mb-3">
                              <p className="font-medium text-sm text-gray-700 mb-1">Réponse du candidat:</p>
                              <p className="whitespace-pre-wrap">
                                {Array.isArray(answer.answer) 
                                  ? answer.answer.join(', ')
                                  : answer.answer || 'Aucune réponse fournie'}
                              </p>
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note (sur 20)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="20"
                                step="0.5"
                                value={grades[answer.questionId]?.score ?? ''}
                                onChange={(e) => {
                                  const score = parseFloat(e.target.value);
                                  setGrades(prev => ({
                                    ...prev,
                                    [answer.questionId]: {
                                      ...prev[answer.questionId],
                                      score: isNaN(score) ? 0 : Math.min(20, Math.max(0, score))
                                    }
                                  }));
                                }}
                                className="w-20 p-1 border rounded-md"
                                required
                              />
                            </div>
                            <div className="mt-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Commentaire
                              </label>
                              <textarea
                                value={grades[answer.questionId]?.feedback ?? ''}
                                onChange={(e) => {
                                  setGrades(prev => ({
                                    ...prev,
                                    [answer.questionId]: {
                                      ...prev[answer.questionId],
                                      feedback: e.target.value
                                    }
                                  }));
                                }}
                                rows={3}
                                className="w-full p-2 border rounded-md"
                                placeholder="Commentaires sur la réponse..."
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowGradingModal(false);
                          setGrades({});
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                      >
                        Enregistrer la correction
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Historique des Paiements</h2>
              
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Candidat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Montant</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Méthode</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Statut</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{payment.candidateName}</td>
                          <td className="py-3 px-4 text-gray-900">{formatPrice(payment.amount)}</td>
                          <td className="py-3 px-4 text-gray-900 capitalize">{payment.method}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              payment.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'completed' ? 'Complété' :
                               payment.status === 'pending' ? 'En attente' : 'Échoué'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(payment.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'certificates' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Gestion des Certificats</h2>
              
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Candidat</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Score</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Date émission</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {certificates.map((certificate) => (
                        <tr key={certificate.id} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-medium text-gray-900">{certificate.candidateName}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-green-600">{certificate.score}/100</span>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{formatDate(certificate.issuedAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => downloadCertificate(certificate)}
                              >
                                <Download className="h-3 w-3 mr-1" />
                                Télécharger
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => sendCertificateByEmail(certificate)}
                              >
                                <Mail className="h-3 w-3 mr-1" />
                                Envoyer
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytiques et Rapports</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Taux de réussite</h3>
                  <p className="text-3xl font-bold text-green-600">85%</p>
                  <p className="text-sm text-gray-500">Score moyen: 78/100</p>
                </Card>
                
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Revenus mensuels</h3>
                  <p className="text-3xl font-bold text-blue-600">{formatPrice(150000)}</p>
                  <p className="text-sm text-gray-500">+12% ce mois</p>
                </Card>
                
                <Card>
                  <h3 className="font-semibold text-gray-900 mb-2">Temps moyen correction</h3>
                  <p className="text-3xl font-bold text-orange-600">24h</p>
                  <p className="text-sm text-gray-500">Objectif: 48h</p>
                </Card>
              </div>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Paramètres</h2>
              
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration de l'examen</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Durée de l'examen (minutes)
                    </label>
                    <Input type="number" defaultValue="60" className="w-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix de l'examen (FCFA)
                    </label>
                    <Input type="number" defaultValue="50000" className="w-32" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Score minimum pour certification
                    </label>
                    <Input type="number" defaultValue="70" className="w-32" />
                  </div>
                  <Button>Sauvegarder les paramètres</Button>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' ? 'Nouvel utilisateur' : 
                 modalMode === 'edit' ? 'Modifier utilisateur' : 'Détails utilisateur'}
              </h3>
              <button onClick={closeUserModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom"
                  value={userForm.firstName}
                  onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Nom"
                  value={userForm.lastName}
                  onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <Input
                  label="Téléphone"
                  value={userForm.phone}
                  onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                  <input
                    type="text"
                    value="Administrateur"
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                  />
                  <input
                    type="hidden"
                    value="admin"
                    onChange={(e) => setUserForm({...userForm, role: 'admin'})}
                  />
                </div>
                <Input
                  label="Profession"
                  value={userForm.profession}
                  onChange={(e) => setUserForm({...userForm, profession: e.target.value})}
                  disabled={modalMode === 'view'}
                />
                {userForm.role === 'examiner' && (
                  <>
                    <Input
                      label="Spécialisation"
                      value={userForm.specialization}
                      onChange={(e) => setUserForm({...userForm, specialization: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                    <Input
                      label="Expérience"
                      value={userForm.experience}
                      onChange={(e) => setUserForm({...userForm, experience: e.target.value})}
                      disabled={modalMode === 'view'}
                    />
                  </>
                )}
                {modalMode === 'create' && userForm.role === 'admin' && (
                  <>
                    <Input
                      label="Mot de passe (min 6 caractères)"
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      disabled={modalMode === 'view'}
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      type="password"
                      value={userForm.passwordConfirm}
                      onChange={(e) => setUserForm({ ...userForm, passwordConfirm: e.target.value })}
                      disabled={modalMode === 'view'}
                    />
                  </>
                )}
              </div>
              
              {modalMode !== 'view' && (
                <div className="flex space-x-3 mt-6">
                  <Button variant="secondary" onClick={closeUserModal} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={saveUser} className="flex-1">
                    {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Examiner Modal */}
      {showExaminerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {modalMode === 'create' ? 'Nouvel examinateur' : 'Modifier examinateur'}
              </h3>
              <button onClick={closeExaminerModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <Input
                  label="Prénom"
                  value={examinerForm.firstName}
                  onChange={(e) => setExaminerForm({...examinerForm, firstName: e.target.value})}
                />
                <Input
                  label="Nom"
                  value={examinerForm.lastName}
                  onChange={(e) => setExaminerForm({...examinerForm, lastName: e.target.value})}
                />
                <Input
                  label="Email"
                  type="email"
                  value={examinerForm.email}
                  onChange={(e) => setExaminerForm({...examinerForm, email: e.target.value})}
                />
                {modalMode === 'create' && (
                  <>
                    <Input
                      label="Mot de passe (min 6 caractères)"
                      type="password"
                      value={examinerForm.password}
                      onChange={(e) => setExaminerForm({ ...examinerForm, password: e.target.value })}
                    />
                    <Input
                      label="Confirmer le mot de passe"
                      type="password"
                      value={examinerForm.passwordConfirm}
                      onChange={(e) => setExaminerForm({ ...examinerForm, passwordConfirm: e.target.value })}
                    />
                  </>
                )}
                <Input
                  label="Téléphone"
                  value={examinerForm.phone}
                  onChange={(e) => setExaminerForm({...examinerForm, phone: e.target.value})}
                />
                <Input
                  label="Spécialisation *"
                  value={examinerForm.specialization}
                  onChange={(e) => setExaminerForm({...examinerForm, specialization: e.target.value})}
                  required
                />
                <Input
                  label="Expérience"
                  value={examinerForm.experience}
                  onChange={(e) => setExaminerForm({...examinerForm, experience: e.target.value})}
                />
                
                <div className="flex space-x-3 mt-6">
                  <Button variant="secondary" onClick={closeExaminerModal} className="flex-1">
                    Annuler
                  </Button>
                  <Button onClick={saveExaminer} className="flex-1">
                    {modalMode === 'create' ? 'Créer' : 'Sauvegarder'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publication Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                Publication de l'examen - {selectedCertification} - {selectedModule}
              </h3>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Sélectionnez les questions à publier pour ce module. 
                  Les questions déjà publiées seront remplacées.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Information importante</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    La publication remplacera toutes les questions actuellement publiées pour ce module. 
                    Seules les questions sélectionnées seront disponibles pour les candidats.
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                {questions.filter(
                  q => q.certificationType === selectedCertification && 
                       q.module === selectedModule
                ).map((question, index) => (
                  <div key={question.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`question-${question.id}`}
                      defaultChecked={question.isPublished}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`question-${question.id}`} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-1">
                            Question {index + 1}: {question.questionText}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{question.questionType === 'qcm' ? 'QCM' : 'Texte libre'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Award className="h-4 w-4" />
                              <span>{question.points} points</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{question.timeLimit}s</span>
                            </span>
                            {question.isRequired && (
                              <span className="text-red-600 font-medium">Obligatoire</span>
                            )}
                            {question.isPublished && (
                              <span className="text-green-600 font-medium flex items-center space-x-1">
                                <CheckCircle className="h-4 w-4" />
                                <span>Publiée</span>
                              </span>
                            )}
                          </div>
                          {question.instructions && (
                            <p className="text-xs text-gray-500 mt-1 italic">
                              Instructions: {question.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
              
              {questions.filter(
                q => q.certificationType === selectedCertification && 
                     q.module === selectedModule
              ).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Aucune question trouvée
                  </h3>
                  <p className="text-gray-600">
                    Aucune question n'a été créée pour ce module. 
                    Créez d'abord des questions avant de pouvoir publier l'examen.
                  </p>
                </div>
              )}
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="secondary" 
                  onClick={() => setShowPublishModal(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handlePublishExam}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={questions.filter(
                    q => q.certificationType === selectedCertification && 
                         q.module === selectedModule
                  ).length === 0}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Publier l'examen
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
};