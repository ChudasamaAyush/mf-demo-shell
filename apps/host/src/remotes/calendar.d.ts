declare module 'calendar/Calendar' {
  import type { ComponentType } from 'react';
  import type { Appointment } from '@mf-demo/contracts';

  export interface CalendarProps {
    onAppointmentClick?: (appt: Appointment) => void;
  }

  export const Calendar: ComponentType<CalendarProps>;
}
