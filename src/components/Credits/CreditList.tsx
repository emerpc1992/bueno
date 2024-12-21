import React from 'react';
import { DollarSign, History, XCircle, Trash2, Printer } from 'lucide-react';
import { Credit } from '../../types/credit';
import { formatCurrency } from '../../utils/format';
import { generateCreditReceipt } from '../../utils/creditReceipt';

interface CreditListProps {
  credits: Credit[];
  onMakePayment: (credit: Credit) => void;
  onCancel: (credit: Credit) => void;
  onDelete: (creditId: string) => void;
  onViewHistory: (credit: Credit) => void;
}

export default function CreditList({ credits, onMakePayment, onCancel, onDelete, onViewHistory }: CreditListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateRemainingAmount = (credit: Credit) => {
    const totalPaid = credit.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return credit.finalPrice - totalPaid;
  };

  const handlePrintReceipt = (credit: Credit) => {
    // Create a dummy payment object with total paid amount for receipt
    const totalPaid = credit.payments.reduce((sum, payment) => sum + payment.amount, 0);
    const latestPayment = credit.payments[credit.payments.length - 1] || {
      id: 'summary',
      date: new Date().toISOString(),
      amount: totalPaid,
      method: 'cash'
    };

    const doc = generateCreditReceipt(credit, latestPayment);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
        URL.revokeObjectURL(url);
      };
    }
  };

  const getStatusColor = (status: Credit['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'overdue':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusText = (status: Credit['status']) => {
    switch (status) {
      case 'completed':
        return 'Completado';
      case 'overdue':
        return 'Vencido';
      default:
        return 'Activo';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monto Total</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Saldo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuotas</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {credits.map((credit) => (
            <tr key={credit.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{credit.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  {credit.clientName}
                  <div className="text-xs text-gray-500">{credit.clientPhone}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{credit.productName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(credit.finalPrice)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(calculateRemainingAmount(credit))}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  {credit.payments.length} de {credit.installments}
                  <div className="text-xs text-gray-500">
                    {formatCurrency(credit.installmentAmount)} por cuota
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(credit.dueDate)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={`font-medium ${getStatusColor(credit.status)}`}>
                  {getStatusText(credit.status)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  {credit.status === 'active' && (
                    <button
                      onClick={() => onMakePayment(credit)}
                      className="text-green-600 hover:text-green-900"
                      title="Registrar pago"
                    >
                      <DollarSign className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handlePrintReceipt(credit)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Imprimir factura"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onViewHistory(credit)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver historial"
                  >
                    <History className="w-4 h-4" />
                  </button>
                  {credit.status === 'active' && (
                    <button
                      onClick={() => onCancel(credit)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Cancelar crédito"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  {credit.status === 'cancelled' && (
                    <button
                      onClick={() => onDelete(credit.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar crédito"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {credit.status === 'completed' && (
                    <button
                      onClick={() => onDelete(credit.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar crédito"
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