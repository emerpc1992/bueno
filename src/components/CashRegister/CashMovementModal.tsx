import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface CashMovementModalProps {
  type: 'add' | 'subtract';
  maxAmount?: number;
  onSubmit: (amount: number, reason: string) => void;
  onClose: () => void;
}

export default function CashMovementModal({ type, maxAmount, onSubmit, onClose }: CashMovementModalProps) {
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    const numAmount = Number(amount);
    const reasonRequired = type === 'subtract' ? 'El motivo de retiro es requerido' : 'El motivo es requerido';

    if (!amount || numAmount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    }

    if (type === 'subtract' && maxAmount !== undefined && numAmount > maxAmount) {
      newErrors.amount = `El monto no puede ser mayor a ${formatCurrency(maxAmount)}`;
    }

    if (!reason.trim()) {
      newErrors.reason = reasonRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(Number(amount), reason);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {type === 'add' ? 'Agregar Monto' : 'Retirar Monto'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {type === 'subtract' ? 'Motivo de Retiro *' : 'Motivo *'}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder={type === 'subtract' ? 'Ingrese el motivo del retiro...' : 'Ingrese el motivo...'}
            />
            {errors.reason && <p className="text-red-500 text-sm mt-1">{errors.reason}</p>}
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
              className={`px-4 py-2 text-white rounded-lg ${
                type === 'add' 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {type === 'add' ? 'Agregar' : 'Retirar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}