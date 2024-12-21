import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Staff } from '../../types/staff';

interface StaffFormProps {
  staff?: Staff;
  onSubmit: (staffData: Omit<Staff, 'id' | 'sales' | 'discounts'>) => void;
  onClose: () => void;
  existingCodes: string[];
}

export default function StaffForm({ staff, onSubmit, onClose, existingCodes }: StaffFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    phone: '',
    commissionRate: 30
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (staff) {
      setFormData({
        code: staff.code,
        name: staff.name,
        phone: staff.phone,
        commissionRate: staff.commissionRate
      });
    }
  }, [staff]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) {
      newErrors.code = 'El código es requerido';
    } else if (!staff && existingCodes.includes(formData.code)) {
      newErrors.code = 'Este código ya existe';
    }

    if (!formData.name) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 8 dígitos';
    }

    if (formData.commissionRate < 0 || formData.commissionRate > 100) {
      newErrors.commissionRate = 'La comisión debe estar entre 0% y 100%';
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
            {staff ? 'Editar Colaborador' : 'Nuevo Colaborador'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código *
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={!!staff}
            />
            {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={8}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Porcentaje de Comisión *
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="0"
                max="100"
              />
              <span className="ml-2">%</span>
            </div>
            {errors.commissionRate && <p className="text-red-500 text-sm mt-1">{errors.commissionRate}</p>}
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
              {staff ? 'Guardar Cambios' : 'Crear Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}