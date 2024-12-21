import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteExpenseModalProps {
  onConfirm: (password: string) => void;
  onClose: () => void;
}

export default function DeleteExpenseModal({ onConfirm, onClose }: DeleteExpenseModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('La contraseña es requerida');
      return;
    }
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            Eliminar Gasto
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600">
            Esta acción es irreversible. Por favor, ingrese la contraseña de administrador para confirmar.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de Administrador *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Ingrese la contraseña..."
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Eliminar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}