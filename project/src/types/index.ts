export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  birthDate: string;
  birthPlace: string;
  city: string;
  country: string;
  profession: string;
  role: 'admin' | 'examiner' | 'candidate';
  isActive: boolean;
  createdAt: string;
  hasPaid?: boolean;
  examTaken?: boolean;
  score?: number;
  certificate?: string;
  selectedCertification?: string;
  completedModules?: string[];
  unlockedModules?: string[];
  currentModule?: string;
  examStartDate?: string;
  specialization?: string;
  experience?: string;
}


export interface CertificationModule {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  duration: number; // 60 minutes (20 questions × 3 minutes)
  order: number;
  category?: string;
}

export interface CertificationType {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerModule?: number;
  targetAudience: string;
  objective: string;
  color: string;
  modules: CertificationModule[];
  isActive: boolean;
}
export interface Exam {
  id: string;
  title: string;
  description: string;
  duration: number; // en minutes
  questions: Question[];
  isActive: boolean;
  price: number;
  certificationType?: string;
  moduleId?: string;
  moduleName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'multiple-choice' | 'text';
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  category: string; // Plus flexible pour différentes catégories
}

export interface ExamSubmission {
  id: string;
  candidateId: string;
  examId: string;
  certificationType: string;
  moduleId: string;
  answers: Answer[];
  submittedAt: string;
  score?: number;
  feedback?: string;
  correctedBy?: string;
  correctedAt?: string;
  status: 'pending' | 'corrected' | 'rejected';
}

export interface Answer {
  questionId: string;
  value: string | number;
  comment?: string;
  pointsAwarded?: number;
  isCorrect?: boolean;
  correctedBy?: string;
  correctedAt?: string;
}

export interface Payment {
  id: string;
  candidateId: string;
  amount: number;
  method: 'stripe' | 'cinetpay';
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  createdAt: string;
  certificationType: string;
  paymentType: 'full' | 'per-module';
  moduleId?: string;
}

export interface Certificate {
  id: string;
  candidateId: string;
  certificationType: string;
  completedModules: string[];
  overallScore: number;
  issuedAt: string;
  certificateUrl: string;
  isComplete: boolean;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  isLoading: boolean;
  getToken: () => string;
}

export interface ExamSession {
  id: string;
  candidateId: string;
  certificationType: string;
  moduleId: string;
  startedAt: string;
  expiresAt: string; // 3 days from start
  currentModule: string;
  completedModules: string[];
  status: 'active' | 'completed' | 'expired';
}