import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from './chart-card.component';
import { AuthBridgeService } from './auth-bridge';

interface Stat {
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  bars: number[];
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

@Component({
  selector: 'reports-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCardComponent],
  template: `
    <header class="rd-header">
      <div class="rd-title">
        <strong>Reports</strong>
        <span class="rd-range">{{ weekLabel }}</span>
      </div>
      <ng-container *ngIf="user(); else anon">
        <span class="rd-spacer"></span>
        Viewing as <strong>{{ user()!.name }}</strong>
        <span class="rd-role">{{ user()!.role }}</span>
      </ng-container>
      <ng-template #anon>
        <span class="rd-spacer"></span>
        <span class="rd-anon">Not signed in</span>
      </ng-template>
    </header>

    <div class="grid">
      <chart-card *ngFor="let s of stats()"
                  [title]="s.title"
                  [value]="s.value"
                  [delta]="s.delta"
                  [positive]="s.positive"
                  [bars]="s.bars"
                  [dayLabels]="days" />
    </div>
  `,
  styles: [`
    :host { color: var(--color-text, #0f172a); display: block; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .rd-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      background: var(--color-surface, #f8fafc);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 8px;
      font-size: 13px;
      color: var(--color-text-muted, #475569);
    }
    .rd-title {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .rd-title strong {
      color: var(--color-text, #0f172a);
      font-size: 14px;
    }
    .rd-range {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .rd-spacer { flex: 1; }
    .rd-header strong {
      color: var(--color-text, #0f172a);
    }
    .rd-role {
      background: color-mix(in srgb, var(--color-primary, #6366f1) 18%, transparent);
      color: var(--color-primary, #4f46e5);
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .rd-anon {
      opacity: 0.7;
    }
  `],
})
export class ReportsDashboardComponent {
  private readonly authBridge = inject(AuthBridgeService);
  readonly user = computed(() => this.authBridge.state().user);

  readonly days = DAYS;
  readonly weekLabel = 'Week of May 13 – May 19, 2026';

  stats = signal<Stat[]>([
    { title: 'Revenue this week', value: '$13,420', delta: '+12.7%',  positive: true,  bars: [3, 5, 6, 7, 9, 11, 14] },
    { title: 'No-show rate',      value: '2.9%',    delta: '-1.1 pp', positive: true,  bars: [6, 5, 5, 4, 5, 4, 3]   },
    { title: 'Top staff',         value: 'Alex',    delta: '94% util',positive: true,  bars: [7, 8, 9, 8, 9, 10, 11] },
    { title: 'Avg ticket',        value: '$71.20',  delta: '+8.2%',   positive: true,  bars: [5, 6, 6, 7, 6, 8, 7]   },
  ]);
}
