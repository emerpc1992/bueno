import React from 'react';
import { X } from 'lucide-react';
import { Client, Purchase } from '../../types/client';
import { formatCurrency } from '../../utils/format';

interface PurchaseHistoryProps {
  client: Client;
  onClose: () => void;
}

export default function PurchaseHistory({ client, onClose }: PurchaseHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Compras
            </h2>
            <p className="text-gray-600">Cliente: {client.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {client.purchases.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Este cliente aún no tiene compras registradas.
            </div>
          ) : (
            <div className="space-y-6">
              {client.purchases.map((purchase: Purchase) => (
                <div key={purchase.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-sm text-gray-500">
                        {formatDate(purchase.date)}
                      </div>
                      <div className="font-medium text-gray-900">
                        Total: {formatCurrency(purchase.total)}
                      </div>
                    </div>
                  </div>
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="text-left pb-2">Producto</th>
                        <th className="text-right pb-2">Cantidad</th>
                        <th className="text-right pb-2">Precio</th>
                        <th className="text-right pb-2">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {purchase.products.map((product) => (
                        <tr key={product.id}>
                          <td className="py-2">{product.name}</td>
                          <td className="text-right py-2">{product.quantity}</td>
                          <td className="text-right py-2">{formatCurrency(product.price)}</td>
                          <td className="text-right py-2">
                            {formatCurrency(product.price * product.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
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