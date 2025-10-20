import apiRequest from '../config/api';

export interface ExaminerSubmission {
  id: string;
  exam_id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  answers: Record<string, any>;
  status: 'draft' | 'submitted' | 'under_review' | 'graded';
  started_at: string;
  submitted_at?: string;
  graded_at?: string;
  total_score: number;
  examiner_id?: string;
  examiner_notes?: any;
  created_at: string;
  updated_at: string;
}

export interface QuestionWithAnswer {
  question: {
    id: string;
    question_text: string;
    question_type: string;
    reference_answer: string;
    instructions: string;
    points: number;
    time_limit: number;
    answer_options: string[];
    is_required: boolean;
  };
  candidate_answer: any;
  is_answered: boolean;
}

export interface SubmissionDetails extends ExaminerSubmission {
  questions_details: {
    question_id: string;
    question_text: string;
    question_type: string;
    candidate_answer: any;
    reference_answer: string;
    instructions: string;
    points_possible: number;
    answer_options: string[];
  }[];
  candidate: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export interface ExaminerStats {
  total_assigned: number;
  pending: number;
  graded: number;
  average_score: number;
}

export interface GradeData {
  question_id: string;
  score: number;
  feedback: string;
}

export class ExaminerService {
  /**
   * Récupérer les soumissions assignées à l'examinateur
   */
  static async getSubmissions(filters?: {
    status?: string;
    certification_type?: string;
    module?: string;
  }): Promise<{ success: boolean; submissions: ExaminerSubmission[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.certification_type) params.append('certification_type', filters.certification_type);
    if (filters?.module) params.append('module', filters.module);

    const queryString = params.toString();
    const endpoint = `/examiner/exam-submissions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(endpoint, 'GET');
  }

  /**
   * Récupérer une soumission spécifique avec les questions de référence
   */
  static async getSubmission(id: string): Promise<{ success: boolean; submission: SubmissionDetails }> {
    return apiRequest(`/examiner/exam-submissions/${id}`, 'GET');
  }

  /**
   * Corriger une soumission
   */
  static async gradeSubmission(
    submissionId: string, 
    grades: GradeData[], 
    overallFeedback: string, 
    totalScore: number
  ): Promise<{ success: boolean; message: string; submission: ExaminerSubmission; score_info: any }> {
    return apiRequest(`/examiner/exam-submissions/${submissionId}/grade`, 'PUT', {
      grades,
      total_score: totalScore
    });
  }

  /**
   * Récupérer les statistiques de l'examinateur
   */
  static async getStats(): Promise<{ success: boolean; stats: ExaminerStats }> {
    return apiRequest('/examiner/exam-submissions-stats', 'GET');
  }
}

