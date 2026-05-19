import { useState } from 'react';
import type { Appointment } from '@mf-demo/contracts';
import { CalendarRemote } from '../remotes/CalendarRemote';

export function CalendarPage() {
  const [selected, setSelected] = useState<Appointment | null>(null);

  return (
    <section>
      <h1>Calendar</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>
        Rendered from the <code>calendar</code> remote loaded via Module Federation
        at runtime. The host bundle does not contain this component.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 280px' : '1fr', gap: 16 }}>
        <CalendarRemote onAppointmentClick={setSelected} />
        {selected && (
          <aside className="placeholder" style={{ padding: 16 }}>
            <h3 style={{ margin: '0 0 8px' }}>Appointment</h3>
            <div><strong>{selected.clientName}</strong></div>
            <div>{selected.service} · {selected.durationMinutes} min</div>
            <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 8 }}>
              with {selected.staffName} at {new Date(selected.startISO).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
            </div>
            <button
              style={{ marginTop: 12 }}
              onClick={() => setSelected(null)}
              type="button"
            >
              Close
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}
