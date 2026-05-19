import type { Appointment } from '@mf-demo/contracts';
export interface CalendarProps {
    onAppointmentClick?: (appt: Appointment) => void;
}
export declare function Calendar({ onAppointmentClick }: CalendarProps): import("react/jsx-runtime").JSX.Element;
