import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Minus, Trash2 } from 'lucide-react';
import { Sale, SaleProduct } from '../../types/sale';
import { Product } from '../../types/product';
import { Staff } from '../../types/staff';
import { Client } from '../../types/client';
import { formatCurrency } from '../../utils/format';
import { storage } from '../../utils/storage';
import { generateReceipt } from '../../utils/receipt';

interface SaleFormProps {
  products: Product[];
  staff: Staff[];
  clients: Client[];
  onSubmit: (saleData: Omit<Sale, 'id' | 'date'>) => void;
  onClose: () => void;
}

export default function SaleForm({ products, staff, clients, onSubmit, onClose }: SaleFormProps) {
  const [formData, setFormData] = useState({
    clientName: '',
    clientCode: '',
    isNewClient: false,
    products: [] as SaleProduct[],
    staffId: '',
    staffName: '',
    staffCommission: 0,
    staffCommissionRate: 30,
    subtotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: 'cash' as const,
    reference: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [showClientSearch, setShowClientSearch] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNewClientRegistration = () => {
    if (!clientSearchTerm.trim()) {
      setErrors({ clientName: 'El nombre del cliente es requerido' });
      return;
    }

    // Generate a unique code for the new client
    const newCode = `C${Date.now().toString().slice(-6)}`;

    // Create new client object
    const newClient = {
      id: Date.now().toString(),
      code: newCode,
      name: clientSearchTerm,
      phone: '',
      purchases: []
    };

    // Update form data first
    setFormData(prev => ({
      ...prev,
      clientName: newClient.name,
      clientCode: newClient.code,
      isNewClient: false
    }));

    // Save the new client
    const currentClients = storage.clients.load();
    storage.clients.save([...currentClients, newClient]);

    setShowClientSearch(false);
    setClientSearchTerm('');
  };

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()) ||
    client.code.toLowerCase().includes(clientSearchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const subtotal = formData.products.reduce((sum, p) => sum + (p.finalPrice * p.quantity), 0);
    const total = subtotal - formData.discount;
    const profit = formData.products.reduce((sum, p) => 
      sum + ((p.finalPrice - p.originalPrice) * p.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      total,
      staffCommission: formData.staffId ? (profit * (formData.staffCommissionRate / 100)) : 0
    }));
  }, [formData.products, formData.discount, formData.staffId, formData.staffCommissionRate]);

  const handleAddProduct = (product: Product) => {
    if (product.quantity === 0) {
      alert('Este producto está agotado');
      return;
    }

    const existingProduct = formData.products.find(p => p.id === product.id);
    
    if (existingProduct) {
      // Verify stock availability
      if (existingProduct.quantity + 1 > product.quantity) {
        alert('No hay suficiente stock disponible');
        return;
      }

      setFormData({
        ...formData,
        products: formData.products.map(p =>
          p.id === product.id
            ? { ...p, quantity: p.quantity + 1 }
            : p
        )
      });
    } else {
      // Add new product with quantity check
      if (product.quantity < 1) {
        alert('No hay suficiente stock disponible');
        return;
      }

      setFormData({
        ...formData,
        products: [
          ...formData.products,
          {
            id: product.id,
            code: product.code,
            name: product.name,
            quantity: 1,
            originalPrice: product.costPrice,
            finalPrice: product.salePrice,
            category: product.category
          }
        ]
      });
    }
    setShowProductSearch(false);
  };

  const handleClientSelect = (client: Client) => {
    setFormData({
      ...formData,
      isNewClient: false,
      clientName: client.name,
      clientCode: client.code
    });
    setShowClientSearch(false);
  };

  const handleManualClientEntry = () => {
    setFormData({
      ...formData,
      clientName: clientSearchTerm,
      isNewClient: true,
      clientCode: ''
    });
    setShowClientSearch(false);
    setClientSearchTerm('');
  };

  const handleUpdateQuantity = (productId: string, change: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const currentProduct = formData.products.find(p => p.id === productId);
    if (!currentProduct) return;

    const newQuantity = currentProduct.quantity + change;

    // Check if the new quantity would exceed available stock
    if (newQuantity > product.quantity) {
      alert('No hay suficiente stock disponible');
      return;
    }

    // Don't allow quantity below 1
    if (newQuantity < 1) return;

    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.id === productId
          ? { ...p, quantity: newQuantity }
          : p
      )
    });
  };

  const handleUpdatePrice = (productId: string, newPrice: number) => {
    setFormData({
      ...formData,
      products: formData.products.map(p =>
        p.id === productId
          ? { ...p, finalPrice: newPrice }
          : p
      )
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setFormData({
      ...formData,
      products: formData.products.filter(p => p.id !== productId)
    });
  };

  const handleStaffSelect = (selectedStaff: Staff) => {
    setFormData({
      ...formData,
      staffId: selectedStaff.id,
      staffName: selectedStaff.name,
      staffCommissionRate: selectedStaff.commissionRate
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'El nombre del cliente es requerido';
    }

    if (formData.products.length === 0) {
      newErrors.products = 'Debe agregar al menos un producto';
    }

    if (formData.paymentMethod !== 'cash' && !formData.reference) {
      newErrors.reference = 'La referencia es requerida para pagos con tarjeta o transferencia';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create sale data
        const saleData = {
          ...formData,
          invoiceNumber: Date.now(), // This will be replaced with the actual invoice number
          date: new Date().toISOString(),
          status: 'active' as const
        };

        // Submit the sale first
        onSubmit(saleData);

        // Generate and print receipt after successful submission
        setTimeout(() => {
          const doc = generateReceipt(saleData);
          const blob = doc.output('blob');
          const url = URL.createObjectURL(blob);
          const newWindow = window.open(url, '_blank');
          if (newWindow) {
            newWindow.onload = () => {
              newWindow.print();
              URL.revokeObjectURL(url);
            };
          }
        }, 100); // Small delay to ensure sale is saved first
      } catch (error) {
        console.error('Error processing sale:', error);
        alert('Error al procesar la venta. Por favor intente nuevamente.');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Nueva Venta
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {formData.isNewClient ? 'Nombre del Cliente Nuevo *' : 'Nombre del Cliente *'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.clientName}
                    onClick={() => setShowClientSearch(true)}
                    readOnly
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder={formData.isNewClient ? "Ingrese el nombre del cliente" : "Buscar cliente..."}
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSearch(true)}
                    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    title={formData.isNewClient ? "Buscar cliente existente" : "Buscar cliente"}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
                {formData.isNewClient && (
                  <p className="text-sm text-gray-500 mt-1">
                    Cliente nuevo - No registrado en el sistema
                  </p>
                )}
              </div>
              {errors.clientName && <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Productos *
              </label>
              <button
                type="button"
                onClick={() => setShowProductSearch(true)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Producto
              </button>
            </div>
            {errors.products && <p className="text-red-500 text-sm mb-2">{errors.products}</p>}
            
            <div className="border rounded-lg divide-y">
              {formData.products.map((product) => (
                <div key={product.id} className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      Código: {product.code} - {product.category}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(product.id, -1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) => handleUpdateQuantity(
                          product.id,
                          parseInt(e.target.value) - product.quantity
                        )}
                        className="w-16 px-2 py-1 border rounded text-center"
                        min="1"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(product.id, 1)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="number"
                      value={product.finalPrice}
                      onChange={(e) => handleUpdatePrice(product.id, parseFloat(e.target.value))}
                      className="w-24 px-2 py-1 border rounded text-right"
                      min={product.originalPrice}
                      step="0.01"
                    />
                    <div className="w-24 text-right">
                      {formatCurrency(product.finalPrice * product.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(product.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Colaborador (opcional)
              </label>
              <select
                value={formData.staffId}
                onChange={(e) => {
                  const selectedStaff = staff.find(s => s.id === e.target.value);
                  if (selectedStaff) {
                    handleStaffSelect(selectedStaff);
                  }
                }}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar colaborador</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {formData.staffId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Porcentaje de Comisión
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={formData.staffCommissionRate}
                    onChange={(e) => setFormData({
                      ...formData,
                      staffCommissionRate: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                  <span className="ml-2">%</span>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Pago *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({
                  ...formData,
                  paymentMethod: e.target.value as 'cash' | 'card' | 'transfer'
                })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="cash">Efectivo</option>
                <option value="card">Tarjeta</option>
                <option value="transfer">Transferencia</option>
              </select>
            </div>

            {formData.paymentMethod !== 'cash' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Referencia *
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder={`Número de ${formData.paymentMethod === 'card' ? 'autorización' : 'transferencia'}`}
                />
                {errors.reference && <p className="text-red-500 text-sm mt-1">{errors.reference}</p>}
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(formData.subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Descuento:</span>
                  <input
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData({
                      ...formData,
                      discount: Math.min(formData.subtotal, Math.max(0, Number(e.target.value)))
                    })}
                    className="w-24 px-2 py-1 border rounded text-right"
                    min="0"
                    max={formData.subtotal}
                    step="0.01"
                  />
                </div>
                {formData.staffId && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Comisión ({formData.staffCommissionRate}%):</span>
                    <span>{formatCurrency(formData.staffCommission)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(formData.total)}</span>
                </div>
              </div>
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
              Completar Venta
            </button>
          </div>
        </form>

        {showClientSearch && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full">
              <div className="p-4 border-b">
                <input
                  type="text"
                  value={clientSearchTerm}
                  onChange={(e) => {
                    const value = e.target.value;
                    setClientSearchTerm(value);
                    setFormData(prev => ({
                      ...prev,
                      clientName: value,
                      isNewClient: true
                    }));
                  }}
                  placeholder="Buscar por nombre o código..."
                  className="w-full px-4 py-2 border rounded-lg"
                  autoFocus
                />
              </div>
              <div className="max-h-96 overflow-y-auto p-4">
                {filteredClients.length > 0 ? (
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left">Código</th>
                        <th className="text-left">Nombre</th>
                        <th className="text-left">Teléfono</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map((client) => (
                        <tr
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                          className="hover:bg-gray-50 cursor-pointer"
                        >
                          <td className="py-2">{client.code}</td>
                          <td>{client.name}</td>
                          <td>{client.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center space-y-4 py-4">
                    <p className="text-gray-500">No se encontraron clientes registrados</p>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleManualClientEntry}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      >
                        Ingresar Cliente Temporal
                      </button>
                      <button
                        type="button"
                        onClick={handleNewClientRegistration}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 block w-full"
                      >
                        Registrar Como Nuevo Cliente
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-4 border-t">
                <button
                  onClick={() => setShowClientSearch(false)}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

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
                  autoFocus
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
                          onClick={() => handleAddProduct(product)}
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