import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data pour la démo
const mockUsers: User[] = [
  {
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
    createdAt: '2024-01-01',
  },
  {
    id: '2',
    email: 'examiner@leadership.com',
    firstName: 'John',
    lastName: 'Examiner',
    phone: '+237123456790',
    address: '456 Examiner Avenue',
    birthDate: '1975-05-15',
    birthPlace: 'Douala',
    city: 'Douala',
    country: 'Cameroun',
    profession: 'Professeur',
    role: 'examiner',
    isActive: true,
    createdAt: '2024-01-02',
  },
  {
    id: '3',
    email: 'candidate@leadership.com',
    firstName: 'Marie',
    lastName: 'Candidate',
    phone: '+237123456791',
    address: '789 Candidate Street',
    birthDate: '1990-03-20',
    birthPlace: 'Bamenda',
    city: 'Bamenda',
    country: 'Cameroun',
    profession: 'Ingénieur',
    role: 'candidate',
    isActive: true,
    createdAt: '2024-01-03',
    hasPaid: true,
    examTaken: false,
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation de l'API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulation de l'API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email!,
      firstName: userData.firstName!,
      lastName: userData.lastName!,
      phone: userData.phone!,
      address: userData.address!,
      birthDate: userData.birthDate!,
      birthPlace: userData.birthPlace!,
      city: userData.city!,
      country: userData.country!,
      profession: userData.profession!,
      role: 'candidate',
      isActive: true,
      createdAt: new Date().toISOString(),
      hasPaid: false,
      examTaken: false,
    };

    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  };

  // Récupérer l'utilisateur du localStorage au chargement
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};