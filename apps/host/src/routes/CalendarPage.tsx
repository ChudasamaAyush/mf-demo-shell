import { useState } from 'react';
import type { Appointment } from '@mf-demo/contracts';
import { CalendarRemote } from '../remotes/CalendarRemote';

function endTime(startISO: string, durationMinutes: number): string {
  const end = new Date(new Date(startISO).getTime() + durationMinutes * 60_000);
  return end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function startTime(startISO: string): string {
  return new Date(startISO).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function CalendarPage() {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <section>
      <h1>Calendar</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: -4 }}>
        Rendered from the <code>calendar</code> remote loaded via Module Federation
        at runtime. The host bundle does not contain this component.
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: selected ? '1fr 300px' : '1fr',
        gap: 16,
        alignItems: 'start',
      }}>
        <CalendarRemote onAppointmentClick={setSelected} />
        {selected && (
          <aside className="appt-panel">
            <header className="appt-panel-header">
              <h3>Appointment</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="appt-panel-close"
                aria-label="Close"
              >×</button>
            </header>
            <span className={`appt-status appt-status-${selected.status}`}>
              {selected.status.replace('-', ' ')}
            </span>
            <div className="appt-client">{selected.clientName}</div>
            <div className="appt-service">{selected.service}</div>
            <dl className="appt-meta">
              <dt>When</dt>
              <dd>{startTime(selected.startISO)} – {endTime(selected.startISO, selected.durationMinutes)}</dd>
              <dt>Duration</dt>
              <dd>{selected.durationMinutes} min</dd>
              <dt>Staff</dt>
              <dd>{selected.staffName}</dd>
            </dl>
          </aside>
        )}
      </div>
    </section>
  );
}
