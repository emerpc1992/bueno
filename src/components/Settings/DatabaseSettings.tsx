import React, { useState, useEffect } from 'react';
import { Database } from 'lucide-react';
import { FirebaseConfig, loadFirebaseConfig, saveFirebaseConfig, isValidConfig } from '../../utils/firebaseConfig';
import { db } from '../../utils/firebase/config';

interface ConnectionStatus {
  isConnected: boolean;
  message: string;
}

export default function DatabaseSettings() {
  const [config, setConfig] = useState<FirebaseConfig>(loadFirebaseConfig);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    message: 'Verificando conexión...'
  });

  // Check connection status periodically
  useEffect(() => {
    const checkConnection = () => {
      const isConnected = db !== null && isValidConfig(config);
      setConnectionStatus({
        isConnected,
        message: isConnected ? 'Conexión Exitosa' : 'Sin Conexión'
      });
    };

    // Initial check
    checkConnection();

    // Set up interval
    const interval = setInterval(checkConnection, 5000);

    // Cleanup
    return () => clearInterval(interval);
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!Object.values(config).every(value => value.trim())) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return;
    }

    try {
      saveFirebaseConfig(config);
      setMessage({ type: 'success', text: 'Configuración guardada correctamente. La página se recargará.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
        <Database className="w-6 h-6 mr-2" />
        Configuración de Firebase
        <div className="ml-4 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className={`text-sm ${connectionStatus.isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {connectionStatus.message}
          </span>
          {connectionStatus.isConnected && (
            <span className="ml-2 text-sm text-gray-500">
              Base de datos conectada: {config.projectId}
            </span>
          )}
        </div>
      </h2>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="AIzaSyD-yyoJqi8AYcVVAb9btqmhhNCS8cqOILY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auth Domain
            </label>
            <input
              type="text"
              value={config.authDomain}
              onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your-app.firebaseapp.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project ID
            </label>
            <input
              type="text"
              value={config.projectId}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your-project-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Bucket
            </label>
            <input
              type="text"
              value={config.storageBucket}
              onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="your-app.appspot.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Messaging Sender ID
            </label>
            <input
              type="text"
              value={config.messagingSenderId}
              onChange={(e) => setConfig({ ...config, messagingSenderId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="123456789012"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App ID
            </label>
            <input
              type="text"
              value={config.appId}
              onChange={(e) => setConfig({ ...config, appId: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="1:123456789012:web:abcdef1234567890"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}