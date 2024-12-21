import React from 'react';
import { Edit, Trash2, XCircle } from 'lucide-react';
import { Appointment } from '../../types/appointment';
import { formatCurrency } from '../../utils/format';

interface AppointmentListProps {
  appointments: Appointment[];
  onEdit: (appointment: Appointment) => void;
  onCancel: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  userRole: string;
}

export default function AppointmentList({ 
  appointments, 
  onEdit, 
  onCancel, 
  onDelete,
  userRole 
}: AppointmentListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-NI', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hora</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <tr key={appointment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appointment.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appointment.clientName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {appointment.clientPhone}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(appointment.reservationCost)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatDate(appointment.date)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatTime(appointment.time)}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {appointment.note || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {appointment.status === 'cancelled' ? (
                  <div>
                    <span className="text-red-600 font-medium">Cancelada</span>
                    {appointment.cancellationReason && (
                      <p className="text-xs text-gray-500 mt-1">
                        Motivo: {appointment.cancellationReason}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-green-600 font-medium">Programada</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex space-x-2">
                  {appointment.status === 'scheduled' && (
                    <>
                      <button
                        onClick={() => onEdit(appointment)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onCancel(appointment)}
                        className="text-yellow-600 hover:text-yellow-900"
                        title="Cancelar"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <a
                        href={`https://wa.me/505${appointment.clientPhone}?text=${encodeURIComponent(
                          `¡Hola ${appointment.clientName}!\nTe confirmamos tu cita en Alvaro Rugama Make Up Studio & Beauty Salon:\n\n` +
                          `Fecha: ${formatDate(appointment.date)}\n` +
                          `Hora: ${formatTime(appointment.time)}\n` +
                          `Costo: ${formatCurrency(appointment.reservationCost)}` +
                          (appointment.note ? `\nNota: ${appointment.note}` : '')
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-900"
                        title="Enviar información por WhatsApp"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                        </svg>
                      </a>
                    </>
                  )}
                  {appointment.status === 'cancelled' && userRole === 'admin' && (
                    <button
                      onClick={() => onDelete(appointment.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
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