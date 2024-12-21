import React, { useState, useEffect, useCallback } from 'react';
import { Plus } from 'lucide-react';
import AppointmentList from './AppointmentList';
import AppointmentForm from './AppointmentForm';
import CancelAppointmentModal from './CancelAppointmentModal';
import { Appointment } from '../../types/appointment';
import { storage } from '../../utils/storage';

interface AppointmentsProps {
  userRole: string;
}

interface AppointmentsProps {
  userRole: string;
}

export default function Appointments({ userRole }: AppointmentsProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | undefined>();

  // Load initial data
  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoading(true);
      try {
        const data = await storage.appointments.load();
        setAppointments(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError('Error loading appointments');
        setAppointments([]);
      } finally {
        setIsLoading(false);
      }
    };
    loadAppointments();
  }, []);

  // Save appointments when they change
  const saveAppointments = useCallback(async (newAppointments: Appointment[]) => {
    try {
      await storage.appointments.save(newAppointments);
      setAppointments(newAppointments);
    } catch (err) {
      console.error('Error saving appointments:', err);
      setError('Error saving appointments');
    }
  }, []);

  const handleAddAppointment = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment = {
      ...appointmentData,
      id: Date.now().toString(),
      status: 'scheduled' as const
    };
    saveAppointments([...appointments, newAppointment]);
    setShowAppointmentForm(false);
  };

  const handleEditAppointment = (appointmentData: Omit<Appointment, 'id' | 'status'>) => {
    if (editingAppointment) {
      setAppointments(appointments.map(a => 
        a.id === editingAppointment.id ? { ...a, ...appointmentData } : a
      ));
      saveAppointments(appointments.map(a => a.id === editingAppointment.id ? { ...a, ...appointmentData } : a));
      setShowAppointmentForm(false);
    }
  };

  const handleCancelAppointment = (reason: string) => {
    if (cancellingAppointment) {
      saveAppointments(appointments.map(a =>
        a.id === cancellingAppointment.id
          ? { ...a, status: 'cancelled', cancellationReason: reason }
          : a
      ));
      setCancellingAppointment(undefined);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    if (userRole !== 'admin') {
      alert('Solo los administradores pueden eliminar citas');
      return;
    }
    
    if (window.confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
      const updatedAppointments = appointments.filter(a => a.id !== appointmentId);
      setAppointments(updatedAppointments);
      
      // Save to storage after deletion
      storage.appointments.save(updatedAppointments).catch(error => {
        console.error('Error saving appointments after deletion:', error);
        setAppointments(appointments); // Restore state if save fails
        alert('Error al eliminar la cita. Por favor intente nuevamente.');
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Citas</h2>
        <button
          onClick={() => {
            setEditingAppointment(undefined);
            setShowAppointmentForm(true);
          }}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Cita
        </button>
      </div>

      {appointments.length > 0 ? (
        <AppointmentList
          appointments={appointments}
          onEdit={(appointment) => {
            if (appointment.status !== 'scheduled') {
              alert('No se pueden editar citas canceladas');
              return;
            }
            setEditingAppointment(appointment);
            setShowAppointmentForm(true);
          }}
          onCancel={(appointment) => setCancellingAppointment(appointment)}
          onDelete={handleDeleteAppointment}
          userRole={userRole}
        />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
          No hay citas registradas. Comienza agregando una nueva.
        </div>
      )}

      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          onSubmit={editingAppointment ? handleEditAppointment : handleAddAppointment}
          onClose={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
          }}
          existingCodes={appointments.map(a => a.code)}
        />
      )}

      {cancellingAppointment && (
        <CancelAppointmentModal
          onConfirm={handleCancelAppointment}
          onClose={() => setCancellingAppointment(undefined)}
        />
      )}
    </div>
  );
}