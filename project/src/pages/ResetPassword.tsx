import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import apiRequest from '../config/api';

const ResetPassword: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!token || !email) {
      setError('Lien invalide. Reprenez la procédure depuis "Mot de passe oublié".');
      return;
    }
    if (password.length < 6 || password !== confirm) {
      setError('Mot de passe invalide ou confirmation différente.');
      return;
    }
    setLoading(true);
    try {
      const res: any = await apiRequest('/auth/password/reset', 'POST', {
        email,
        token,
        password,
        password_confirmation: confirm
      });
      if (res?.success) {
        setDone(true);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(res?.message || 'Réinitialisation impossible.');
      }
    } catch (e: any) {
      setError(e?.message || 'Erreur réseau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold mb-4">Réinitialiser le mot de passe</h1>
        {done ? (
          <p className="text-sm text-gray-700">Mot de passe modifié. Redirection vers la page de connexion...</p>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmer"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Envoi...' : 'Réinitialiser'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ResetPassword;


