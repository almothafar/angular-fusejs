import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Density } from './view-controls.component';

/** What the card renders — projected from a source record through its field mapping. */
export interface CardVM {
  id: string;
  /** May contain highlight <em> markup, so it is bound via [innerHTML]. */
  title: string;
  subtitle: string;
  meta: string;
  matchPercent: number | null;
  lang: string | null;
}

/** A single result card. Owns its comfortable/compact layout via the `density` input. */
@Component({
  selector: 'app-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="book-card" [class.compact]="density() === 'compact'" [attr.data-lang]="card().lang">
      <div class="book-content">
        <h3 class="book-title" [innerHTML]="card().title"></h3>
        @if (card().subtitle) {
          <p class="book-author" [innerHTML]="card().subtitle"></p>
        }
        <div class="book-meta">
          @if (card().meta) {
            <span class="book-year" [innerHTML]="card().meta"></span>
          }
          @if (card().matchPercent !== null) {
            <span class="book-score"> Match: {{ card().matchPercent }}% </span>
          }
        </div>
      </div>
    </div>
  `,
  styleUrl: './result-card.component.scss',
})
export class ResultCardComponent {
  readonly card = input.required<CardVM>();
  readonly density = input.required<Density>();
}
