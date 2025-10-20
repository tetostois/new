import React, { useState } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = await login(email, password);
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
  };

  const demoAccounts = [
    { email: 'admin@leadership.com', role: 'Administrateur', password: 'admin123' },
    { email: 'examiner@leadership.com', role: 'Examinateur', password: 'examiner123' },
    { email: 'candidate@leadership.com', role: 'Candidat', password: 'candidate123' }
  ];

  return (
    <div className="w-full max-w-md">
      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="text-gray-600 mt-2">Accédez à votre compte</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            required
          />

          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button type="submit" className="bg-green-700 hover:bg-green-700 w-full" isLoading={isLoading}>
            Se connecter
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Comptes de démonstration :</p>
          <div className="space-y-2">
            {demoAccounts.map((account, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded text-xs">
                <span className="font-medium">{account.role}</span>
                <span className="text-gray-600">{account.email}</span>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                >
                  Utiliser
                </Button>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};