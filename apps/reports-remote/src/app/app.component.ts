import { Component } from '@angular/core';
import { ReportsDashboardComponent } from './reports-dashboard.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReportsDashboardComponent],
  template: `
    <main class="page">
      <h1>Reports (standalone)</h1>
      <reports-dashboard></reports-dashboard>
    </main>
  `,
  styles: [`
    .page {
      font-family: ui-sans-serif, system-ui, sans-serif;
      padding: 24px;
      color: #0f172a;
    }
  `],
})
export class AppComponent {}
