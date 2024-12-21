import React from 'react';
import { X, Printer } from 'lucide-react';
import { Credit } from '../../types/credit';
import { formatCurrency } from '../../utils/format';
import { generateCreditReceipt } from '../../utils/creditReceipt';

interface PaymentHistoryProps {
  credit: Credit;
  onClose: () => void;
}

export default function PaymentHistory({ credit, onClose }: PaymentHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Efectivo';
      case 'card':
        return 'Tarjeta';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  const handlePrintReceipt = (payment: Payment) => {
    const doc = generateCreditReceipt(credit, payment);
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

  const calculateRemainingAmount = () => {
    const totalPaid = credit.payments.reduce((sum, payment) => sum + payment.amount, 0);
    return credit.finalPrice - totalPaid;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Pagos
            </h2>
            <p className="text-gray-600">
              Cliente: {credit.clientName} - Código: {credit.code}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Monto Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(credit.finalPrice)}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Total Pagado</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(credit.payments.reduce((sum, p) => sum + p.amount, 0))}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Saldo Pendiente</p>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(calculateRemainingAmount())}</p>
            </div>
          </div>

          <div className="space-y-4">
            {credit.payments.length > 0 ? (
              credit.payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm text-gray-500">{formatDate(payment.date)}</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </span>
                        <button
                          onClick={() => handlePrintReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Imprimir recibo"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {getPaymentMethodText(payment.method)}
                        {payment.reference && (
                          <span className="ml-2">- Ref: {payment.reference}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No hay pagos registrados</p>
            )}
          </div>
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