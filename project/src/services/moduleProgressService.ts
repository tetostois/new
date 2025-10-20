import apiRequest from '../config/api';

export interface ModuleProgressData {
  id: number;
  candidate_id: number;
  certification_type: string;
  module_id: string;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  unlocked_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  score: number | null;
  max_score: number | null;
  exam_submission_id: number | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleProgressResponse {
  success: boolean;
  progress: ModuleProgressData[];
  message?: string;
}

export interface ModuleProgressSingleResponse {
  success: boolean;
  progress: ModuleProgressData;
  message?: string;
}

export interface UnlockModuleRequest {
  certification_type: string;
  module_id: string;
}

export interface StartModuleRequest {
  certification_type: string;
  module_id: string;
}

export interface CompleteModuleRequest {
  certification_type: string;
  module_id: string;
  score?: number;
  max_score?: number;
  exam_submission_id?: number;
}

export class ModuleProgressService {
  /**
   * Obtenir la progression des modules pour un candidat
   */
  static async getModuleProgress(certificationType?: string): Promise<ModuleProgressResponse> {
    const params = certificationType ? `?certification_type=${encodeURIComponent(certificationType)}` : '';
    return apiRequest(`/candidate/module-progress${params}`, 'GET');
  }

  /**
   * Obtenir le statut d'un module spécifique
   */
  static async getModuleStatus(certificationType: string, moduleId: string): Promise<ModuleProgressSingleResponse> {
    return apiRequest(`/candidate/module-progress/${certificationType}/${moduleId}`, 'GET');
  }

  /**
   * Déverrouiller un module
   */
  static async unlockModule(data: UnlockModuleRequest): Promise<ModuleProgressSingleResponse> {
    return apiRequest('/candidate/module-progress/unlock', 'POST', data);
  }

  /**
   * Marquer un module comme en cours
   */
  static async startModule(data: StartModuleRequest): Promise<ModuleProgressSingleResponse> {
    return apiRequest('/candidate/module-progress/start', 'POST', data);
  }

  /**
   * Marquer un module comme terminé
   */
  static async completeModule(data: CompleteModuleRequest): Promise<ModuleProgressSingleResponse> {
    return apiRequest('/candidate/module-progress/complete', 'POST', data);
  }

  /**
   * Obtenir les modules déverrouillés pour une certification
   */
  static async getUnlockedModules(certificationType: string): Promise<ModuleProgressData[]> {
    const response = await this.getModuleProgress(certificationType);
    if (response.success) {
      return response.progress.filter(module => 
        module.status === 'unlocked' || 
        module.status === 'in_progress' || 
        module.status === 'completed'
      );
    }
    return [];
  }

  /**
   * Obtenir les modules terminés pour une certification
   */
  static async getCompletedModules(certificationType: string): Promise<ModuleProgressData[]> {
    const response = await this.getModuleProgress(certificationType);
    if (response.success) {
      return response.progress.filter(module => module.status === 'completed');
    }
    return [];
  }

  /**
   * Vérifier si un module est déverrouillé
   */
  static async isModuleUnlocked(certificationType: string, moduleId: string): Promise<boolean> {
    try {
      const response = await this.getModuleStatus(certificationType, moduleId);
      return response.success && (
        response.progress.status === 'unlocked' ||
        response.progress.status === 'in_progress' ||
        response.progress.status === 'completed'
      );
    } catch {
      return false;
    }
  }

  /**
   * Vérifier si un module est terminé
   */
  static async isModuleCompleted(certificationType: string, moduleId: string): Promise<boolean> {
    try {
      const response = await this.getModuleStatus(certificationType, moduleId);
      return response.success && response.progress.status === 'completed';
    } catch {
      return false;
    }
  }

  /**
   * Obtenir le module en cours pour une certification
   */
  static async getCurrentModule(certificationType: string): Promise<ModuleProgressData | null> {
    const response = await this.getModuleProgress(certificationType);
    if (response.success) {
      return response.progress.find(module => module.status === 'in_progress') || null;
    }
    return null;
  }

  /**
   * Obtenir le prochain module à déverrouiller
   */
  static async getNextModuleToUnlock(certificationType: string): Promise<ModuleProgressData | null> {
    const response = await this.getModuleProgress(certificationType);
    if (response.success) {
      return response.progress.find(module => module.status === 'unlocked') || null;
    }
    return null;
  }
}
