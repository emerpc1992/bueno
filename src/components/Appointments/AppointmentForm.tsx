import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Appointment } from '../../types/appointment';

interface AppointmentFormProps {
  appointment?: Appointment;
  onSubmit: (appointmentData: Omit<Appointment, 'id' | 'status'>) => void;
  onClose: () => void;
  existingCodes: string[];
}

export default function AppointmentForm({ appointment, onSubmit, onClose, existingCodes }: AppointmentFormProps) {
  const [formData, setFormData] = useState({
    code: '',
    clientName: '',
    clientPhone: '',
    reservationCost: '',
    date: '',
    time: '',
    note: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (appointment) {
      setFormData({
        code: appointment.code,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        reservationCost: appointment.reservationCost.toString(),
        date: appointment.date,
        time: appointment.time,
        note: appointment.note || ''
      });
    }
  }, [appointment]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code) {
      newErrors.code = 'El código es requerido';
    } else if (!appointment && existingCodes.includes(formData.code)) {
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

    if (!formData.reservationCost || parseFloat(formData.reservationCost) <= 0) {
      newErrors.reservationCost = 'El costo de reserva debe ser mayor a 0';
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.date = 'La fecha no puede ser anterior a hoy';
      }
    }

    if (!formData.time) {
      newErrors.time = 'La hora es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({
        code: formData.code,
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        reservationCost: parseFloat(formData.reservationCost),
        date: formData.date,
        time: formData.time,
        note: formData.note
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {appointment ? 'Editar Cita' : 'Nueva Cita'}
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
              disabled={!!appointment}
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
              Costo de Reserva *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.reservationCost}
              onChange={(e) => setFormData({ ...formData, reservationCost: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.reservationCost && <p className="text-red-500 text-sm mt-1">{errors.reservationCost}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              min={new Date().toISOString().split('T')[0]}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hora *
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nota (opcional)
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => setFormData({ ...formData, note: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Agregar notas o detalles adicionales..."
            />
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
              {appointment ? 'Guardar Cambios' : 'Crear Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}