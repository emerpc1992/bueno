import React from 'react';
import { X, XCircle } from 'lucide-react';
import { Staff, Sale, Discount } from '../../types/staff';
import { formatCurrency } from '../../utils/format';

interface StaffHistoryProps {
  staff: Staff;
  onUpdateSale: (saleId: string, commissionPaid: boolean) => void;
  onCancelDiscount: (discountId: string) => void;
  onClose: () => void;
}

export default function StaffHistory({ staff, onUpdateSale, onCancelDiscount, onClose }: StaffHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotalCommission = () => {
    // Calculate commission for each sale individually
    const salesCommissions = staff.sales.map(sale => ({
      id: sale.id,
      commission: sale.commission,
      commissionPaid: sale.commissionPaid
    }));

    // Sum up paid and unpaid commissions separately
    const paidCommissions = salesCommissions
      .filter(sale => sale.commissionPaid)
      .reduce((total, sale) => total + sale.commission, 0);

    const unpaidCommissions = salesCommissions
      .filter(sale => !sale.commissionPaid)
      .reduce((total, sale) => total + sale.commission, 0);

    // Only count active discounts
    const totalDiscounts = staff.discounts
      .filter(discount => discount.status === 'active')
      .reduce((total, discount) => total + discount.amount, 0);

    return {
      paidCommissions,
      unpaidCommissions,
      totalDiscounts,
      total: paidCommissions + unpaidCommissions - totalDiscounts
    };
  };

  const commissionSummary = calculateTotalCommission();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Ventas y Descuentos
            </h2>
            <p className="text-gray-600">Colaborador: {staff.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Resumen</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600">Total Ventas</p>
                <p className="text-2xl font-bold text-purple-700">
                  {formatCurrency(staff.sales.reduce((total, sale) => total + sale.total, 0))}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600">Total Comisiones</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(commissionSummary.paidCommissions + commissionSummary.unpaidCommissions)}
                  <span className="block text-sm">
                    (Pagado: {formatCurrency(commissionSummary.paidCommissions)})
                    <br />
                    (Pendiente: {formatCurrency(commissionSummary.unpaidCommissions)})
                  </span>
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600">Total Descuentos</p>
                <p className="text-2xl font-bold text-red-700">
                  {formatCurrency(commissionSummary.totalDiscounts)}
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-lg font-medium text-gray-800">
                Comisión Total: {formatCurrency(commissionSummary.total)}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Ventas</h3>
              {staff.sales.length === 0 ? (
                <p className="text-gray-500">No hay ventas registradas.</p>
              ) : (
                <div className="space-y-4">
                  {staff.sales.map((sale: Sale) => (
                    <div key={sale.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <div className="text-sm text-gray-500">
                            {formatDate(sale.date)}
                          </div>
                          <div className="font-medium text-gray-900">
                            Total: {formatCurrency(sale.total)}
                          </div>
                          <div className="text-sm text-green-600">
                            Comisión: {formatCurrency(sale.commission)}
                            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              sale.commissionPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sale.commissionPaid ? 'Pagada' : 'Pendiente'}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            onUpdateSale(sale.id, !sale.commissionPaid);
                          }}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            sale.commissionPaid
                              ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          {sale.commissionPaid ? 'Marcar como Pendiente' : 'Marcar como Pagada'}
                        </button>
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
                          {sale.products.map((product) => (
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

            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">Descuentos</h3>
              {staff.discounts.length === 0 ? (
                <p className="text-gray-500">No hay descuentos registrados.</p>
              ) : (
                <div className="space-y-4">
                  {staff.discounts.map((discount: Discount) => (
                    <div key={discount.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-500">
                            {formatDate(discount.date)}
                          </div>
                          <div className={`font-medium ${discount.status === 'cancelled' ? 'text-gray-500' : 'text-red-600'}`}>
                            Monto: {formatCurrency(discount.amount)}
                            {discount.status === 'cancelled' && (
                              <span className="ml-2 text-sm text-red-600">
                                (Cancelado)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            Motivo: {discount.reason}
                          </div>
                          {discount.status === 'cancelled' && discount.cancellationReason && (
                            <div className="text-sm text-red-500 mt-1">
                              Motivo de cancelación: {discount.cancellationReason}
                            </div>
                          )}
                        </div>
                        {discount.status === 'active' && (
                          <button
                            onClick={() => onCancelDiscount(discount.id)}
                            className="text-yellow-600 hover:text-yellow-900"
                            title="Cancelar descuento"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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