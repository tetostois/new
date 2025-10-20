import apiRequest from '../config/api';
import { User } from '../types';

// Vérifier si on doit utiliser les mocks
const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

// Stockage en mémoire pour les utilisateurs simulés
const mockUsers: User[] = [];

// Types pour les requêtes d'authentification
interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends Omit<User, 'id' | 'createdAt' | 'isActive' | 'role' | 'hasPaid' | 'examTaken'> {
  password: string;
  confirmPassword: string;
}

interface AuthResponse {
  user: User;
  token: string; // compat front
}

// Ajout des utilisateurs de test par défaut
if (mockUsers.length === 0) {
  // Admin
  mockUsers.push({
    id: '1',
    email: 'admin@leadership.com',
    firstName: 'Admin',
    lastName: 'System',
    phone: '+237123456789',
    address: '123 Admin Street',
    birthDate: '1980-01-01',
    birthPlace: 'Yaoundé',
    city: 'Yaoundé',
    country: 'Cameroun',
    profession: 'Administrateur',
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasPaid: true,
    examTaken: false
  });

  // Examinateur
  mockUsers.push({
    id: '2',
    email: 'examinateur@leadership.com',
    firstName: 'Jean',
    lastName: 'Dupont',
    phone: '+237123456780',
    address: '456 Exam Street',
    birthDate: '1975-05-15',
    birthPlace: 'Douala',
    city: 'Douala',
    country: 'Cameroun',
    profession: 'Professeur',
    role: 'examiner',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasPaid: true,
    examTaken: false
  });

  // Candidat
  mockUsers.push({
    id: '3',
    email: 'candidat@leadership.com',
    firstName: 'Marie',
    lastName: 'Martin',
    phone: '+237123456781',
    address: '789 Candidat Avenue',
    birthDate: '1990-03-20',
    birthPlace: 'Bamenda',
    city: 'Bamenda',
    country: 'Cameroun',
    profession: 'Développeur',
    role: 'candidate',
    isActive: true,
    createdAt: new Date().toISOString(),
    hasPaid: false,
    examTaken: false
  });
}

// Mock pour l'authentification locale
const mockAuth = {
  login: async ({ email, password }: LoginRequest): Promise<AuthResponse> => {
    // Simulation de délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Vérification des identifiants
    const user = mockUsers.find(u => u.email === email);
    
    if (user && (email === 'admin@leadership.com' ? password === 'password' : true)) {
      return {
        user,
        token: `mock-jwt-token-${user.id}`,
      };
    }
    
    throw new Error('Identifiants invalides');
  },
  
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('Début de l\'enregistrement avec les données:', data);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Vérifier si l'email existe déjà
      const existingUser = mockUsers.find(u => u.email === data.email);
      if (existingUser) {
        console.log('Email déjà utilisé:', data.email);
        throw new Error('Un utilisateur avec cet email existe déjà');
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        email: data.email,
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        phone: data.phone || '',
        address: data.address || '',
        birthDate: data.birthDate || new Date().toISOString(),
        birthPlace: data.birthPlace || '',
        city: data.city || '',
        country: data.country || 'Cameroun',
        profession: data.profession || '',
        role: 'candidate',
        isActive: true,
        createdAt: new Date().toISOString(),
        hasPaid: false,
        examTaken: false,
      };
      
      // Ajouter le nouvel utilisateur au tableau
      mockUsers.push(newUser);
      console.log('Nouvel utilisateur créé avec succès:', newUser);
      console.log('Liste actuelle des utilisateurs:', mockUsers);
      
      return {
        user: { ...newUser },
        token: `mock-jwt-token-${newUser.id}`,
      };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      throw error;
    }
  },
};

// Fonctions d'authentification réelles
const realAuth = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest<any>('/auth/login', 'POST', credentials);
    console.log('Réponse de l\'API de connexion:', response);
    // Backend renvoie access_token; on mappe vers token pour le front
    return { user: response.user, token: response.access_token } as AuthResponse;
  },
  
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    // Nettoyer les données avant envoi
    const { confirmPassword, ...userDataToSend } = userData;
    
    // Créer un objet avec uniquement les champs nécessaires
    const cleanUserData = {
      firstName: userDataToSend.firstName,
      lastName: userDataToSend.lastName,
      email: userDataToSend.email,
      phone: userDataToSend.phone,
      address: userDataToSend.address,
      birthDate: userDataToSend.birthDate,
      birthPlace: userDataToSend.birthPlace,
      city: userDataToSend.city,
      country: userDataToSend.country,
      profession: userDataToSend.profession,
      password: userDataToSend.password
    };

    const response = await apiRequest<any>('/auth/register', 'POST', cleanUserData);
    console.log('Réponse de l\'API d\'inscription:', response);
    return { user: response.user, token: response.access_token } as AuthResponse;
  },
  
  getCurrentUser: async (token: string): Promise<User> => {
    return apiRequest<User>('/auth/me', 'GET', null, {
      'Authorization': `Bearer ${token}`,
    });
  },
};

// Export des fonctions avec basculement selon la configuration
export const login = useMocks ? mockAuth.login : realAuth.login;
export const register = useMocks ? mockAuth.register : realAuth.register;

export const getCurrentUser = async (token: string): Promise<User> => {
  if (useMocks) {
    // Simulation de la récupération de l'utilisateur à partir du token
    const userId = token.replace('mock-jwt-token-', '');
    const user = mockUsers.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  }
  
  return realAuth.getCurrentUser(token);
};

// Fonction utilitaire pour gérer le token JWT
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};
