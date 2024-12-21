import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { Credit } from '../../types/credit';
import { Product } from '../../types/product';
import { formatCurrency } from '../../utils/format';

interface CreditFormProps {
  products: Product[];
  onSubmit: (creditData: Omit<Credit, 'id' | 'payments' | 'status' | 'createdAt'>) => void;
  onClose: () => void;
  existingCodes: string[];
}

export default function CreditForm({ products, onSubmit, onClose, existingCodes }: CreditFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    clientName: '',
    clientPhone: '',
    productId: '',
    productName: '',
    originalPrice: 0,
    finalPrice: 0,
    dueDate: '',
    installments: 1,
    installmentAmount: 0
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) {
      newErrors.code = 'El código es requerido';
    } else if (existingCodes.includes(formData.code)) {
      newErrors.code = 'Este código ya existe';
    }

    if (!formData.clientName) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    if (!formData.clientPhone) {
      newErrors.clientPhone = 'El teléfono es requerido';
    } else if (!/^\d{8}$/.test(formData.clientPhone)) {
      newErrors.clientPhone = 'El teléfono debe tener 8 dígitos';
    }

    if (!formData.productId) {
      newErrors.productId = 'Debe seleccionar un producto';
    }

    if (formData.finalPrice <= 0) {
      newErrors.finalPrice = 'El precio final debe ser mayor a 0';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La fecha máxima es requerida';
    } else {
      const selectedDate = new Date(formData.dueDate);
      const today = new Date();
      if (selectedDate <= today) {
        newErrors.dueDate = 'La fecha debe ser posterior a hoy';
      }
    }

    if (formData.installments < 1) {
      newErrors.installments = 'Debe haber al menos 1 cuota';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProductSelect = (product: Product) => {
    setFormData({
      ...formData,
      productId: product.id,
      productName: product.name,
      originalPrice: product.costPrice,
      finalPrice: product.salePrice
    });
    setShowProductSearch(false);
  };

  useEffect(() => {
    if (formData.finalPrice && formData.installments) {
      setFormData(prev => ({
        ...prev,
        installmentAmount: formData.finalPrice / formData.installments
      }));
    }
  }, [formData.finalPrice, formData.installments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            Nuevo Crédito
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.clientPhone}
                onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                maxLength={8}
              />
              {errors.clientPhone && <p className="text-red-500 text-sm mt-1">{errors.clientPhone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Producto *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.productName}
                  onClick={() => setShowProductSearch(true)}
                  readOnly
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                  placeholder="Buscar producto..."
                />
                <Search className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Original
              </label>
              <input
                type="number"
                value={formData.originalPrice}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Final *
              </label>
              <input
                type="number"
                value={formData.finalPrice}
                onChange={(e) => setFormData({ ...formData, finalPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              {errors.finalPrice && <p className="text-red-500 text-sm mt-1">{errors.finalPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Máxima *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuotas *
              </label>
              <input
                type="number"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
              />
              {errors.installments && <p className="text-red-500 text-sm mt-1">{errors.installments}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monto por Cuota
              </label>
              <input
                type="number"
                value={formData.installmentAmount}
                readOnly
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
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
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Crear Crédito
            </button>
          </div>
        </form>

        {showProductSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-4 border-b">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre, código o categoría..."
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {filteredProducts.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Código</th>
                        <th className="text-left">Nombre</th>
                        <th className="text-left">Categoría</th>
                        <th className="text-right">Precio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          onClick={() => handleProductSelect(product)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-2">{product.code}</td>
                          <td>{product.name}</td>
                          <td>{product.category}</td>
                          <td className="text-right">{formatCurrency(product.salePrice)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-center text-gray-500">No se encontraron productos</p>
                )}
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowProductSearch(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}