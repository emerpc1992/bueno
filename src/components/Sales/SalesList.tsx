import React from 'react';
import { XCircle, Trash2, Printer } from 'lucide-react';
import { generateReceiptHTML } from '../../utils/receipt';
import { Sale } from '../../types/sale';
import { formatCurrency } from '../../utils/format';

interface SalesListProps {
  sales: Sale[];
  onCancel: (sale: Sale) => void;
  onDelete: (saleId: string) => void;
}

export default function SalesList({ sales, onCancel, onDelete }: SalesListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
  
  const handlePrintReceipt = (sale: Sale) => {
    const receiptWindow = window.open('', 'receipt', 'width=800,height=600');
    if (!receiptWindow) return;

    const receiptHTML = generateReceiptHTML(sale);

    receiptWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura #${String(sale.invoiceNumber).padStart(6, '0')}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @media print {
              body { margin: 0; background: white; }
              .receipt { box-shadow: none; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body style="margin: 0; padding: 20px; background: #f5f5f5;">
          ${receiptHTML}
          <script>
            window.onload = function() {
              window.print();
              // Don't close the window immediately to allow manual printing if needed
            };
          </script>
        </body>
      </html>
    `);

    receiptWindow.document.close();
  };

  return (
    <div className="space-y-4"> 
      {[...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
        <div key={sale.id} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{sale.clientName}</h3>
                <p className="text-sm text-gray-500">
                  Factura #{String(sale.invoiceNumber).padStart(6, '0')} - 
                  {formatDate(sale.date)} - 
                  <span className={`${
                    sale.status === 'cancelled' ? 'text-red-600' : 'text-green-600'
                  } font-medium`}>
                    {sale.status === 'cancelled' ? 'Cancelada' : 'Activa'}
                  </span>
                  {sale.clientCode && ` - Código: ${sale.clientCode}`}
                </p>
                {sale.status === 'cancelled' && sale.cancellationReason && (
                  <p className="text-sm text-red-500 mt-1">
                    Motivo: {sale.cancellationReason}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{formatCurrency(sale.total)}</div>
                <p className="text-sm text-gray-500">
                  {getPaymentMethodText(sale.paymentMethod)}
                  {sale.reference && ` - Ref: ${sale.reference}`}
                </p>
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => handlePrintReceipt(sale)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Imprimir factura"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  {sale.status === 'active' && (
                    <button
                      onClick={() => onCancel(sale)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Cancelar venta"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  )}
                  {sale.status === 'cancelled' && (
                    <button
                      onClick={() => onDelete(sale.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar venta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            {sale.staffName && (
              <div className="mt-2 text-sm text-gray-600">
                Vendedor: {sale.staffName}
                <span className="ml-2 text-green-600">
                  (Comisión: {formatCurrency(sale.staffCommission || 0)}
                  {sale.staffDiscount && sale.staffDiscount.status === 'active' && (
                    <span className="text-red-600">
                      {' '}- Descuento: {formatCurrency(sale.staffDiscount.amount)}
                    </span>
                  )})
                </span>
                {sale.staffDiscount && (
                  <div className="text-sm text-gray-500 mt-1">
                    {sale.staffDiscount.status === 'active' ? (
                      <>Motivo descuento: {sale.staffDiscount.reason}</>
                    ) : (
                      <span className="text-red-500">
                        Descuento cancelado: {sale.staffDiscount.cancellationReason}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sale.products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">
                        Código: {product.code} - {product.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-900">{product.quantity}</td>
                    <td className="px-6 py-4 text-right text-gray-900">{formatCurrency(product.finalPrice)}</td>
                    <td className="px-6 py-4 text-right text-gray-900">
                      {formatCurrency(product.finalPrice * product.quantity)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-right font-medium">Subtotal:</td>
                  <td className="px-6 py-4 text-right font-medium">{formatCurrency(sale.subtotal)}</td>
                </tr>
                {sale.discount > 0 && (
                  <tr className="bg-gray-50">
                    <td colSpan={3} className="px-6 py-4 text-right font-medium text-red-600">Descuento:</td>
                    <td className="px-6 py-4 text-right font-medium text-red-600">
                      -{formatCurrency(sale.discount)}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-50">
                  <td colSpan={3} className="px-6 py-4 text-right font-bold">Total:</td>
                  <td className="px-6 py-4 text-right font-bold">{formatCurrency(sale.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}