import React from 'react';
import { Edit, Trash2, XCircle } from 'lucide-react';
import { Expense } from '../../types/expense';
import { formatCurrency } from '../../utils/format';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onCancel: (expense: Expense) => void;
  onDelete: (expenseId: string) => void;
}

export default function ExpenseList({ expenses, onEdit, onCancel, onDelete }: ExpenseListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(expense.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {expense.category}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {expense.reason}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {expense.note || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {expense.status === 'cancelled' ? (
                  <div>
                    <span className="text-red-600 font-medium">Cancelado</span>
                    {expense.cancellationReason && (
                      <p className="text-xs text-gray-500 mt-1">
                        Motivo: {expense.cancellationReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-green-600 font-medium">Activo</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  {expense.status === 'active' && (
                    <>
                      <button
                        onClick={() => onEdit(expense)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCancel(expense)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Cancelar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {expense.status === 'cancelled' && (
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}