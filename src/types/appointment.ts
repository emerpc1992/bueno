export interface Appointment {
  id: string;
  code: string;
  clientName: string;
  clientPhone: string;
  reservationCost: number;
  date: string;
  time: string;
  status: 'scheduled' | 'cancelled';
  note?: string;
  cancellationReason?: string;
}