import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  type,
  ...props
}) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  const [show, setShow] = React.useState(false);
  const isPassword = type === 'password';

  const baseInput = (
    <input
      id={inputId}
      className={`
        w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        ${error ? 'border-red-500' : 'border-gray-300'}
        ${className}
      `}
      type={isPassword ? (show ? 'text' : 'password') : type}
      {...props}
    />
  );
  
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {isPassword ? (
        <div className="relative">
          {baseInput}
          <button
            type="button"
            aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            onClick={() => setShow(s => !s)}
            tabIndex={0}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      ) : (
        baseInput
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};