export const AUTH_CHANNEL = 'mf-demo:auth';
export const THEME_CHANNEL = 'mf-demo:theme';

export interface Appointment {
  id: string;
  staffId: string;
  staffName: string;
  clientName: string;
  service: string;
  startISO: string;
  durationMinutes: number;
  status: 'booked' | 'completed' | 'cancelled' | 'no-show';
}
