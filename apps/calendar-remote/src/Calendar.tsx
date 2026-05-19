import './styles.css';
import appointments from './data/mock-appointments.json';
import type { Appointment } from '@mf-demo/contracts';
import { useAuth } from './useAuth';

const STAFF = ['Alex', 'Brooke', 'Casey', 'Devon'];
const HOURS = Array.from({ length: 10 }, (_, i) => 9 + i);

export interface CalendarProps {
  onAppointmentClick?: (appt: Appointment) => void;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function Calendar({ onAppointmentClick }: CalendarProps) {
  const { user, logout } = useAuth();
  const data = appointments as Appointment[];

  const cellMap = new Map<string, Appointment[]>();
  for (const appt of data) {
    const startHour = new Date(appt.startISO).getHours();
    const key = `${appt.staffName}|${startHour}`;
    const arr = cellMap.get(key) ?? [];
    arr.push(appt);
    cellMap.set(key, arr);
  }

  const dayLabel = new Date('2026-05-19T00:00:00').toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

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

      <div className="cal-summary">
        <span className="cal-day">{dayLabel}</span>
        <span className="cal-sep">·</span>
        <span>{data.length} appointments</span>
        <span className="cal-legend">
          <span className="cal-dot cal-dot-booked" /> booked
          <span className="cal-dot cal-dot-completed" /> completed
          <span className="cal-dot cal-dot-cancelled" /> cancelled
          <span className="cal-dot cal-dot-no-show" /> no-show
        </span>
      </div>

      <div className="cal-grid">
        <div className="cal-cell cal-head" />
        {HOURS.map((h) => (
          <div key={h} className="cal-cell cal-head">{h}:00</div>
        ))}
        {STAFF.map((staff) => (
          <div key={staff} className="cal-row">
            <div className="cal-cell cal-staff">
              <span className="cal-avatar">{staff.charAt(0)}</span>
              {staff}
            </div>
            {HOURS.map((h) => {
              const appts = cellMap.get(`${staff}|${h}`) ?? [];
              return (
                <div key={h} className="cal-cell cal-slot">
                  {appts.map((appt) => (
                    <button
                      key={appt.id}
                      className={`cal-appt cal-appt-${appt.status}`}
                      onClick={() => onAppointmentClick?.(appt)}
                      title={`${appt.clientName} · ${appt.service}`}
                    >
                      <span className="cal-appt-time">{formatTime(appt.startISO)}</span>
                      <span className="cal-appt-client">{appt.clientName}</span>
                      <span className="cal-appt-service">{appt.service}</span>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
