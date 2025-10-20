import apiRequest from '../config/api';

export interface ExamSubmission {
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
  examiner_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Examiner {
  id: string;
  name: string;
  email: string;
  specialization: string;
  assigned_count: number;
  is_available: boolean;
}

export interface AdminStats {
  total_submissions: number;
  submitted: number;
  under_review: number;
  graded: number;
  pending_assignment: number;
}

export class AdminService {
  /**
   * Récupérer toutes les soumissions d'examens
   */
  static async getExamSubmissions(
    filters?: {
    status?: string;
    certification_type?: string;
    module?: string;
    examiner_id?: string;
    },
    pagination?: { page?: number; per_page?: number }
  ): Promise<{ success: boolean; submissions: ExamSubmission[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.certification_type) params.append('certification_type', filters.certification_type);
    if (filters?.module) params.append('module', filters.module);
    if (filters?.examiner_id) params.append('examiner_id', filters.examiner_id);
    if (pagination?.page) params.append('page', String(pagination.page));
    if (pagination?.per_page) params.append('per_page', String(pagination.per_page));

    const queryString = params.toString();
    const endpoint = `/admin/exam-submissions${queryString ? `?${queryString}` : ''}`;

    const response: any = await apiRequest(endpoint, 'GET');
    return {
      success: !!response.success,
      submissions: Array.isArray(response?.data) ? response.data : (Array.isArray(response?.submissions) ? response.submissions : []),
      pagination: response?.pagination,
    };
  }

  /**
   * Récupérer une soumission spécifique
   */
  static async getExamSubmission(id: string): Promise<{ success: boolean; submission: ExamSubmission; questions?: any[] }> {
    return apiRequest(`/admin/exam-submissions/${id}`, 'GET');
  }

  /**
   * Assigner un examinateur à une soumission
   */
  static async assignExaminer(submissionId: string, examinerId: string): Promise<{ success: boolean; message: string; submission: ExamSubmission }> {
    return apiRequest(`/admin/exam-submissions/${submissionId}/assign`, 'POST', {
      examiner_id: examinerId
    });
  }

  /**
   * Récupérer les statistiques des soumissions
   */
  static async getSubmissionStats(): Promise<{ success: boolean; stats: AdminStats }> {
    return apiRequest('/admin/exam-submissions-stats', 'GET');
  }

  /**
   * Récupérer les examinateurs disponibles
   */
  static async getAvailableExaminers(): Promise<{ success: boolean; examiners: Examiner[] }> {
    return apiRequest('/admin/available-examiners', 'GET');
  }

  /**
   * Récupérer tous les utilisateurs
   */
  static async getUsers(
    options?: { role?: string; status?: string; search?: string; page?: number; per_page?: number }
  ): Promise<{ success: boolean; users: any[]; pagination?: any }> {
    const params = new URLSearchParams();
    if (options?.role) params.append('role', options.role);
    if (options?.status && options.status !== 'all') params.append('status', options.status);
    if (options?.search) params.append('search', options.search);
    if (options?.page) params.append('page', String(options.page));
    if (options?.per_page) params.append('per_page', String(options.per_page));
    const endpoint = `/admin/users${params.toString() ? `?${params.toString()}` : ''}`;
    const response: any = await apiRequest(endpoint, 'GET');
    return {
      success: !!response.success,
      users: Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []),
      pagination: response?.pagination,
    };
  }
}

