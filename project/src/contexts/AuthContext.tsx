import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { API_BASE_URL } from '../config/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Fonctions de gestion de session
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

const setSession = (token: string, user: any) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));

  // Mettre à jour l'en-tête d'autorisation pour les requêtes futures
  if (token) {
    // Cette partie sera utilisée par apiRequest
    // Pas besoin de configurer manuellement les en-têtes ici
  }
};

const clearSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [requireReauth, setRequireReauth] = useState(false);

  // Normalise les champs utilisateur du backend (snake_case) vers camelCase
  const normalizeUser = (raw: any): User => {
    if (!raw) return null as unknown as User;
    // role can be a string or an object like { roleName, ... }
    let roleVal: string = 'candidate';
    if (typeof raw.role === 'string') {
      roleVal = raw.role;
    } else if (raw.role && typeof raw.role === 'object') {
      roleVal = raw.role.roleName ?? raw.role.name ?? String(raw.role?.id ?? 'candidate');
    } else if (raw.role) {
      roleVal = String(raw.role);
    }

    return {
      id: String(raw.id ?? raw.uuid ?? ''),
      firstName: raw.firstName ?? raw.first_name ?? '',
      lastName: raw.lastName ?? raw.last_name ?? '',
      email: raw.email ?? '',
      phone: raw.phone ?? '',
      role: (roleVal ?? 'candidate') as User['role'],
      isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
      address: raw.address ?? '',
      birthDate: raw.birthDate ?? raw.date_of_birth ?? '',
      birthPlace: raw.birthPlace ?? raw.place_of_birth ?? '',
      city: raw.city ?? '',
      country: raw.country ?? '',
      profession: raw.profession ?? '',
      createdAt: raw.createdAt ?? raw.created_at ?? new Date().toISOString(),
      // champs facultatifs connus dans l'app
      specialization: raw.specialization ?? undefined,
      experience: raw.experience ?? undefined,
      // champs utilisés par le flux d'examen
      hasPaid: Boolean(raw.hasPaid ?? raw.has_paid ?? false),
      selectedCertification: raw.selectedCertification ?? raw.selected_certification ?? undefined,
      examTermsAcceptedAt: raw.examTermsAcceptedAt ?? raw.exam_terms_accepted_at ?? undefined,
      examTermsAccepted: Boolean((raw.examTermsAcceptedAt ?? raw.exam_terms_accepted_at) ? true : false),
    } as User;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      const normalized = normalizeUser(data.user);
      setSession(data.access_token, normalized);
      setUser(normalized);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } finally {
      clearSession();
      setUser(null);
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        birthDate: userData.birthDate,
        birthPlace: userData.birthPlace,
        city: userData.city,
        country: userData.country,
        profession: userData.profession,
        password: password,
        confirmPassword: password
      };
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        try {
          const err = await res.json();
          console.error('Register error:', err);
          if (err && typeof window !== 'undefined') {
            sessionStorage.setItem('lastRegisterErrors', JSON.stringify(err));
          }
        } catch {
          const txt = await res.text().catch(() => '');
          if (txt) console.error('Register error (text):', txt);
        }
        return false;
      }
      const data = await res.json();
      const normalized = normalizeUser(data.user);
      setSession(data.access_token, normalized);
      setUser(normalized);
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Récupérer l'utilisateur du localStorage au chargement et optionnellement valider auprès de l'API
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(normalizeUser(parsed));
      } catch {
        setUser(null);
      }
    }
    // Optionnel: valider le token et rafraîchir le profil
    const token = getToken();
    if (token) {
      fetch(`${API_BASE_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => {
          if (!r.ok) {
            console.error('[Auth] /auth/me returned', r.status, r.statusText);
            return null;
          }
          return r.json();
        })
        .then(u => { if (u) {
          const normalized = normalizeUser(u);
          setUser(normalized);
          localStorage.setItem('user', JSON.stringify(normalized));
        } })
        .catch(err => {
          console.error('[Auth] Error fetching /auth/me', err);
        });
    }
  }, []);

  // Détection d'inactivité (5 min) => demande de réauthentification
  useEffect(() => {
    let lastActivity = Date.now();
    let timer: number | undefined;

    const resetTimer = () => {
      lastActivity = Date.now();
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (Date.now() - lastActivity >= 300000) {
          setRequireReauth(true);
        }
      }, 300000);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(evt => window.addEventListener(evt, resetTimer, { passive: true } as any));
    resetTimer();

    return () => {
      if (timer) window.clearTimeout(timer);
      events.forEach(evt => window.removeEventListener(evt, resetTimer as any));
    };
  }, []);

  const reauthenticate = async (password: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ email: user.email, password })
      });
      if (!res.ok) return false;
      const data = await res.json();
      const normalized = normalizeUser(data.user);
      setSession(data.access_token, normalized);
      setUser(normalized);
      setRequireReauth(false);
      return true;
    } catch {
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    getToken: (): string => getToken() || '',
    // propriétés d'extension exposées via contexte (cast pour compat TS)
    ...( { requireReauth, reauthenticate } as Partial<AuthContextType> ),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {requireReauth && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-sm p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Session inactive</h3>
            <p className="text-sm text-gray-600 mb-4">Veuillez saisir votre mot de passe pour continuer.</p>
            <ReauthForm onSubmit={async (pwd) => { const ok = await reauthenticate(pwd); if (!ok) alert('Mot de passe incorrect'); }} />
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

const ReauthForm: React.FC<{ onSubmit: (pwd: string) => void | Promise<void> }> = ({ onSubmit }) => {
  const [pwd, setPwd] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(pwd); }}>
      <input
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
        placeholder="Mot de passe"
        className="w-full border rounded px-3 py-2 mb-4"
        autoFocus
      />
      <button type="submit" className="w-full bg-blue-600 text-white rounded px-3 py-2">Valider</button>
    </form>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
