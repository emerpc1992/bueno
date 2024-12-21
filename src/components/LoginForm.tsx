import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { authenticateUser } from '../utils/auth';
import { loadLoginConfig, defaultConfig } from '../utils/loginConfig';

interface LoginFormProps {
  onLogin: (user: { username: string; role: string }) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [config] = useState(() => {
    try {
      return loadLoginConfig();
    } catch (error) {
      console.error('Error loading config:', error);
      return defaultConfig;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = authenticateUser({ username, password });
    
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: `url("${config.backgroundImage}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md p-8 relative">
        <div className="flex flex-col items-center mb-8">
          <div 
            className="p-3 rounded-full mb-4"
            style={{ backgroundColor: `${config.colors.primary}20` }}
          >
            {config.logoUrl ? (
              <img 
                src={config.logoUrl} 
                alt="Logo"
                className="w-12 h-12 object-contain"
              />
            ) : (
              <Scissors className="w-8 h-8" style={{ color: config.colors.primary }} />
            )}
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-1">
            {config.businessInfo.name}
          </h1>
          <p className="font-medium" style={{ color: config.colors.primary }}>{config.businessInfo.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
              Credenciales inválidas
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full text-white py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: config.colors.primary,
              '&:hover': {
                backgroundColor: `${config.colors.primary}dd`
              }
            }}
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );
}