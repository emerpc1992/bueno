import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { CashMovement } from '../../types/cash';
import { formatCurrency } from '../../utils/format';

interface MovementHistoryProps {
  movements: CashMovement[];
  onClose: () => void;
  onClearHistory: () => void;
}

export default function MovementHistory({ movements, onClose, onClearHistory }: MovementHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Movimientos
            </h2>
            {movements.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-red-600 hover:text-red-900 flex items-center"
                title="Borrar historial"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Borrar Historial
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {movements.length > 0 ? (
            <div className="space-y-4">
              {movements.map((movement) => (
                <div key={movement.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm text-gray-500">
                        {formatDate(movement.date)}
                      </div>
                      <div className={`font-medium ${
                        movement.type === 'add' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {movement.type === 'add' ? '+' : '-'}
                        {formatCurrency(movement.amount)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {movement.reason}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No hay movimientos registrados</p>
          )}
        </div>

        <div className="border-t p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}