import { Suspense, lazy, Component, type ErrorInfo, type ReactNode } from 'react';
import type { Appointment } from '@mf-demo/contracts';

const RemoteCalendar = lazy(async () => {
  const mod = await import('calendar/Calendar');
  return { default: mod.Calendar };
});

interface RemoteErrorBoundaryProps {
  children: ReactNode;
}
interface RemoteErrorBoundaryState {
  error: Error | null;
}

class RemoteErrorBoundary extends Component<RemoteErrorBoundaryProps, RemoteErrorBoundaryState> {
  state: RemoteErrorBoundaryState = { error: null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[CalendarRemote] failed to load remote module', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div className="placeholder">
          Calendar remote failed to load. Is the dev server on{' '}
          <code>http://localhost:3001</code> running?
          <pre style={{ marginTop: 8, fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.error.message}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface CalendarRemoteProps {
  onAppointmentClick?: (appt: Appointment) => void;
}

export function CalendarRemote(props: CalendarRemoteProps) {
  return (
    <RemoteErrorBoundary>
      <Suspense fallback={<div className="placeholder">Loading calendar…</div>}>
        <RemoteCalendar {...props} />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
