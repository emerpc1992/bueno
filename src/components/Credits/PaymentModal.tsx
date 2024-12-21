import React, { useState } from 'react';
import { X } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface PaymentModalProps {
  creditId: string;
  remainingAmount: number;
  onSubmit: (paymentData: {
    amount: number;
    method: 'cash' | 'card' | 'transfer';
    reference?: string;
  }) => void;
  onClose: () => void;
}

export default function PaymentModal({ creditId, remainingAmount, onSubmit, onClose }: PaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: remainingAmount,
    method: 'cash' as const,
    reference: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'El monto debe ser mayor a 0';
    } else if (formData.amount > remainingAmount) {
      newErrors.amount = 'El monto no puede ser mayor al saldo pendiente';
    }

    if (formData.method !== 'cash' && !formData.reference) {
      newErrors.reference = 'La referencia es requerida para pagos con tarjeta o transferencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Registrar Pago
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Saldo Pendiente
            </label>
            <input
              type="text"
              value={formatCurrency(remainingAmount)}
              readOnly
              className="w-full px-3 py-2 border rounded-lg bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto a Pagar *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.amount && <p className="text-red-500 text-sm mt-1">{errors.amount}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Pago *
            </label>
            <select
              value={formData.method}
              onChange={(e) => setFormData({ 
                ...formData, 
                method: e.target.value as 'cash' | 'card' | 'transfer'
              })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>

          {formData.method !== 'cash' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referencia *
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={`Número de ${formData.method === 'card' ? 'autorización' : 'transferencia'}`}
              />
              {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference}</p>}
            </div>
          )}

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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}