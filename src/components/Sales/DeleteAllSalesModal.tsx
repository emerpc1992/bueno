import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteAllSalesModalProps {
  onConfirm: (password: string) => void;
  onClose: () => void;
  error?: string;
}

export default function DeleteAllSalesModal({ onConfirm, onClose, error }: DeleteAllSalesModalProps) {
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setValidationError('La contraseña es requerida');
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
            Eliminar Todas las Ventas
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  ¡Advertencia! Esta acción eliminará permanentemente todas las ventas registradas.
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña de Administrador *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {(validationError || error) && (
              <p className="text-red-500 text-sm mt-1">{validationError || error}</p>
            )}
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
              Eliminar Todas las Ventas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}