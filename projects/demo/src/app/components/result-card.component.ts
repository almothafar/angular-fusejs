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
  /**
   * `null` → the active source has no images, so no cover slot is shown.
   * `''`   → source has images but this item lacks one → show the placeholder.
   * URL    → show the image (falls back to the placeholder on load error).
   */
  imageUrl: string | null;
}

/** Served from `public/` at the app base href. */
const COVER_PLACEHOLDER = 'cover-placeholder.svg';

/** A single result card. Owns its comfortable/compact layout via the `density` input. */
@Component({
  selector: 'app-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="book-card" [class.compact]="density() === 'compact'" [attr.data-lang]="card().lang">
      @if (card().imageUrl !== null) {
        <div class="book-cover">
          <img [src]="card().imageUrl || placeholder" alt="" loading="lazy" (error)="onCoverError($event)" />
        </div>
      }
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

  protected readonly placeholder = COVER_PLACEHOLDER;

  /** Swap a broken image for the placeholder (guarded against an error loop). */
  protected onCoverError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (!img.src.endsWith(COVER_PLACEHOLDER)) {
      img.src = COVER_PLACEHOLDER;
    }
  }
}
