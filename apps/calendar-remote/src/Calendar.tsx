import './styles.css';
import appointments from './data/mock-appointments.json';
import type { Appointment } from '@mf-demo/contracts';
import { useAuth } from './useAuth';

const STAFF = ['Alex', 'Brooke', 'Casey', 'Devon'];
const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i);

export interface CalendarProps {
  onAppointmentClick?: (appt: Appointment) => void;
}

export function Calendar({ onAppointmentClick }: CalendarProps) {
  const { user, logout } = useAuth();

  const byStaff = new Map<string, Appointment[]>();
  for (const staff of STAFF) byStaff.set(staff, []);
  for (const appt of appointments as Appointment[]) {
    byStaff.get(appt.staffName)?.push(appt);
  }

  return (
    <div>
      <div className="cal-auth-banner">
        {user ? (
          <>
            <span>
              Signed in as <strong>{user.name}</strong> · {user.role}
            </span>
            <button type="button" onClick={logout} className="cal-auth-logout">
              Sign out (from calendar)
            </button>
          </>
        ) : (
          <span style={{ opacity: 0.7 }}>Not signed in</span>
        )}
      </div>

      <div className="cal-grid">
        <div className="cal-cell cal-head" />
        {HOURS.map((h) => (
          <div key={h} className="cal-cell cal-head">{h}:00</div>
        ))}
        {STAFF.map((staff) => (
          <div key={staff} className="cal-row">
            <div className="cal-cell cal-staff">{staff}</div>
            {HOURS.map((h) => {
              const appt = byStaff.get(staff)?.find((a) => new Date(a.startISO).getHours() === h);
              return (
                <div key={h} className="cal-cell cal-slot">
                  {appt && (
                    <button className="cal-appt" onClick={() => onAppointmentClick?.(appt)}>
                      {appt.clientName}
                      <small>{appt.service}</small>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
