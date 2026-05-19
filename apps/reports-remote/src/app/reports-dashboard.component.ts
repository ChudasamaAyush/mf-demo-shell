import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartCardComponent } from './chart-card.component';

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
    <div class="grid">
      <chart-card *ngFor="let s of stats()" [title]="s.title" [value]="s.value" [delta]="s.delta" [positive]="s.positive" [bars]="s.bars" />
    </div>
  `,
  styles: [`
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }
  `],
})
export class ReportsDashboardComponent {
  stats = signal<Stat[]>([
    { title: 'Revenue this week', value: '$12,840', delta: '+8.2%', positive: true,  bars: [4, 6, 5, 8, 7, 9, 12] },
    { title: 'No-show rate',      value: '3.4%',    delta: '-0.6pp', positive: true,  bars: [6, 5, 5, 4, 5, 4, 3] },
    { title: 'Top staff',         value: 'Casey',   delta: '92% util', positive: true, bars: [7, 8, 9, 8, 9, 10, 9] },
  ]);
}
