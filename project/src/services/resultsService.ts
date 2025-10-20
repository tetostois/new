import apiRequest from '../config/api';

export interface ModuleResult {
  module_name: string;
  score: number;
  max_score: number;
  percentage: number;
  submitted_at: string;
  graded_at: string;
  examiner_notes?: any;
  status: string;
}

export interface CertificationResults {
  certification_name: string;
  modules: Record<string, ModuleResult>;
  total_score: number;
  max_score: number;
  average_score: number;
}

export interface ResultsResponse {
  success: boolean;
  results: Record<string, CertificationResults>;
}

export const ResultsService = {
  /**
   * Récupérer tous les résultats d'un candidat par certification et module
   */
  async getResults(): Promise<ResultsResponse> {
    return apiRequest('/candidate/results', 'GET');
  },

  /**
   * Récupérer les détails d'un module spécifique
   */
  async getModuleDetails(moduleId: string): Promise<{ success: boolean; module: any }> {
    return apiRequest(`/candidate/results/${moduleId}`, 'GET');
  }
};
