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

@Component({
  selector: 'reports-dashboard',
  standalone: true,
  imports: [CommonModule, ChartCardComponent],
  template: `
    <header class="rd-header">
      <ng-container *ngIf="user(); else anon">
        Viewing as <strong>{{ user()!.name }}</strong>
        <span class="rd-role">{{ user()!.role }}</span>
      </ng-container>
      <ng-template #anon>
        <span class="rd-anon">Not signed in</span>
      </ng-template>
    </header>
    <div class="grid">
      <chart-card *ngFor="let s of stats()"
                  [title]="s.title"
                  [value]="s.value"
                  [delta]="s.delta"
                  [positive]="s.positive"
                  [bars]="s.bars" />
    </div>
  `,
  styles: [`
    :host { color: var(--color-text, #0f172a); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
    .rd-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      margin-bottom: 12px;
      background: var(--color-surface, #f8fafc);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: 6px;
      font-size: 13px;
      color: var(--color-text-muted, #475569);
    }
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

  stats = signal<Stat[]>([
    { title: 'Revenue this week', value: '$12,840', delta: '+8.2%', positive: true,  bars: [4, 6, 5, 8, 7, 9, 12] },
    { title: 'No-show rate',      value: '3.4%',    delta: '-0.6pp', positive: true,  bars: [6, 5, 5, 4, 5, 4, 3] },
    { title: 'Top staff',         value: 'Casey',   delta: '92% util', positive: true, bars: [7, 8, 9, 8, 9, 10, 9] },
  ]);
}
