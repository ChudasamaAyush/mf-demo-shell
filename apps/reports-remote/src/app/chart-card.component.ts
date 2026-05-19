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
        <div *ngFor="let b of bars; let i = index" class="bar-col">
          <span class="bar" [style.height.%]="b * 8"></span>
          <span class="bar-label">{{ dayLabels[i] }}</span>
        </div>
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
      font-size: 12px;
      color: var(--color-text-muted, #64748b);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .delta {
      font-size: 12px;
      color: var(--color-danger, #ef4444);
      font-weight: 600;
    }
    .delta.positive {
      color: var(--color-success, #10b981);
    }
    .value {
      font-size: 28px;
      font-weight: 700;
      margin: 8px 0 14px;
      color: var(--color-text, #0f172a);
      letter-spacing: -0.02em;
    }
    .bars {
      display: flex;
      align-items: flex-end;
      gap: 4px;
      height: 78px;
    }
    .bar-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 4px;
      height: 100%;
    }
    .bar {
      flex: 1;
      background: color-mix(in srgb, var(--color-primary, #6366f1) 85%, transparent);
      border-radius: 3px;
      min-height: 4px;
      align-self: flex-end;
      width: 100%;
      transition: background 0.15s ease;
    }
    .bar-col:last-child .bar {
      background: var(--color-primary, #6366f1);
    }
    .bar-label {
      font-size: 10px;
      color: var(--color-text-muted, #94a3b8);
      text-align: center;
      letter-spacing: 0.04em;
    }
  `],
})
export class ChartCardComponent {
  @Input() title = '';
  @Input() value = '';
  @Input() delta = '';
  @Input() positive = false;
  @Input() bars: number[] = [];
  @Input() dayLabels: string[] = [];
}
