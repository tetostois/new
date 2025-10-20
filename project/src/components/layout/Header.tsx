import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Link } from 'react-router-dom';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  // user.role may be either a string or an object like { roleName, ... }.
  // Cast to any to allow runtime detection (the User type is a union of string literals,
  // so TypeScript would otherwise consider the object branch unreachable).
  const rawRole = (user as any).role;
  const roleName = typeof rawRole === 'string' ? rawRole : (rawRole?.roleName ?? rawRole?.name ?? '');

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'examiner': return 'bg-green-100 text-green-800';
      case 'candidate': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'examiner': return 'Examinateur';
      case 'candidate': return 'Candidat';
      default: return role;
    }
  };

  return (
    <header className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
               {/* Logo */}
                        <Link to="/" className="flex items-center">
                          <div className="flex items-center">
                            <img 
                              src="/images/04.png" 
                              alt="Logo ENALE" 
                              className="h-16 w-70 object-cover"
                            />
                          </div>
                        </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  {user.firstName} {user.lastName}
                </span>
              </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(roleName)}`}>
                {getRoleLabel(roleName)}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};