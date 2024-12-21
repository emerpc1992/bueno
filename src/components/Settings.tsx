import React, { useState } from 'react';
import { updateCredentials, type Credentials } from '../utils/auth';
import { Key, AlertCircle } from 'lucide-react';

interface SettingsProps {
  userRole: string;
}

export default function Settings({ userRole }: SettingsProps) {
  const [adminCredentials, setAdminCredentials] = useState<Credentials>({
    username: '',
    password: '',
    confirmPassword: ''
  });
  
  const [vendorCredentials, setVendorCredentials] = useState<Credentials>({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = (role: 'admin' | 'vendor') => {
    const credentials = role === 'admin' ? adminCredentials : vendorCredentials;
    
    if (credentials.password !== credentials.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }

    if (credentials.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
      return;
    }

    try {
      updateCredentials(role, {
        username: credentials.username,
        password: credentials.password
      });
      setMessage({ type: 'success', text: 'Credenciales actualizadas correctamente' });
      
      // Reset form
      if (role === 'admin') {
        setAdminCredentials({ username: '', password: '', confirmPassword: '' });
      } else {
        setVendorCredentials({ username: '', password: '', confirmPassword: '' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar las credenciales' });
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="w-5 h-5" />
          <p>Solo los administradores pueden acceder a esta sección.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <Key className="w-5 h-5 mr-2" />
          Gestión de Credenciales
        </h2>

        {message && (
          <div className={`p-4 rounded-lg mb-6 ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {/* Admin Credentials */}
          <div className="border-b pb-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Credenciales de Administrador</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Usuario
                </label>
                <input
                  type="text"
                  value={adminCredentials.username}
                  onChange={(e) => setAdminCredentials({
                    ...adminCredentials,
                    username: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={adminCredentials.password}
                  onChange={(e) => setAdminCredentials({
                    ...adminCredentials,
                    password: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={adminCredentials.confirmPassword}
                  onChange={(e) => setAdminCredentials({
                    ...adminCredentials,
                    confirmPassword: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => handleSubmit('admin')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Actualizar Credenciales de Administrador
              </button>
            </div>
          </div>

          {/* Vendor Credentials */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Credenciales de Vendedor</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuevo Usuario
                </label>
                <input
                  type="text"
                  value={vendorCredentials.username}
                  onChange={(e) => setVendorCredentials({
                    ...vendorCredentials,
                    username: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nueva Contraseña
                </label>
                <input
                  type="password"
                  value={vendorCredentials.password}
                  onChange={(e) => setVendorCredentials({
                    ...vendorCredentials,
                    password: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  value={vendorCredentials.confirmPassword}
                  onChange={(e) => setVendorCredentials({
                    ...vendorCredentials,
                    confirmPassword: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => handleSubmit('vendor')}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Actualizar Credenciales de Vendedor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}