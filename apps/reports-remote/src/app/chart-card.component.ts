import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'chart-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="card">
      <header>
        <h3>{{ title }}</h3>
        <span class="delta" [class.positive]="positive">{{ delta }}</span>
      </header>
      <div class="value">{{ value }}</div>
      <div class="bars">
        <span *ngFor="let b of bars" class="bar" [style.height.%]="b * 8"></span>
      </div>
    </article>
  `,
  styles: [`
    .card {
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e2e8f0);
      border-radius: var(--radius-lg, 12px);
      padding: var(--space-4, 16px);
      box-shadow: var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05));
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    h3 {
      margin: 0;
      font-size: 13px;
      color: var(--color-text-muted, #64748b);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .delta {
      font-size: 12px;
      color: var(--color-danger, #ef4444);
    }
    .delta.positive {
      color: var(--color-success, #10b981);
    }
    .value {
      font-size: 28px;
      font-weight: 700;
      margin: 8px 0 12px;
      color: var(--color-text, #0f172a);
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 64px;
    }
    .bar {
      flex: 1;
      background: var(--color-primary, #6366f1);
      border-radius: 2px;
      min-height: 4px;
    }
  `],
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() delta = '';
  @Input() positive = false;
  @Input() bars: number[] = [];
}
