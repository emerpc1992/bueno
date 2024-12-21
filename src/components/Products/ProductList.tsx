import React from 'react';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export default function ProductList({ products, onEdit, onDelete }: ProductListProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Costo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.code}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {product.imageUrl && (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-8 w-8 rounded-full mr-3 object-cover"
                    />
                  )}
                  <span>{product.name}</span>
                  {product.quantity <= product.lowStockThreshold && (
                    <div className="ml-2 flex items-center text-red-500" title="Stock bajo">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className={product.quantity <= product.lowStockThreshold ? 'text-red-600 font-medium' : 'text-gray-900'}>
                  {product.quantity}
                </span>
                {product.quantity <= product.lowStockThreshold && (
                  <p className="text-xs text-red-500">
                    Bajo stock (Min: {product.lowStockThreshold})
                  </p>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.costPrice)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.salePrice)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}