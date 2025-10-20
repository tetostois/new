// Configuration de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Récupérer le token JWT depuis le stockage local
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Fonction utilitaire pour les appels API
const apiRequest = async <T>(
  endpoint: string,
  method: string = 'GET',
  data: any = null,
  headers: HeadersInit = {},
  includeAuth: boolean = true
): Promise<T> => {
  // Préparer les en-têtes
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Ajouter le token d'authentification si disponible
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    method,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    credentials: 'include' as RequestCredentials, // Important pour les cookies et l'authentification
  };

  // Ajouter le corps de la requête si nécessaire
  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const responseData = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      // Créer une erreur avec plus de détails
      const error = new Error(responseData.message || 'Une erreur est survenue');
      // Ajouter les données de la réponse à l'erreur
      (error as any).response = {
        data: responseData,
        status: response.status,
        statusText: response.statusText
      };
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('Erreur API:', error);
    throw error;
  }
};

export default apiRequest;
