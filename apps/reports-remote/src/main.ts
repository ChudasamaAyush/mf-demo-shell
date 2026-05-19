import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { ReportsDashboardComponent } from './app/reports-dashboard.component';

createApplication({ providers: [] })
  .then((app) => {
    const element = createCustomElement(ReportsDashboardComponent, {
      injector: app.injector,
    });
    customElements.define('reports-dashboard', element);
  })
  .catch((err) => console.error('[reports-remote] bootstrap failed', err));
