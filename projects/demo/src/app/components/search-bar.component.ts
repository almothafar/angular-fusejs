import { ChangeDetectionStrategy, Component, computed, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** One entry in the type-ahead suggestions dropdown. */
export interface Suggestion {
  /** Display label — may contain highlight <em> markup (bound via innerHTML). */
  label: string;
  /** Plain text set as the search term when this suggestion is chosen. */
  value: string;
  /** Optional thumbnail (e.g. a flag) shown beside the label. */
  imageUrl: string | null;
}

/**
 * The unified search field, plus an inline "searching…" status and a per-source note.
 * When the active source provides `suggestions`, it renders an ARIA combobox/listbox
 * dropdown with full keyboard navigation (↑/↓/Enter/Esc).
 */
@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-row">
      <div class="search-field" (focusout)="close()">
        <input
          id="demo-search"
          name="search"
          type="text"
          class="search-input"
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="suggest-list"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-activedescendant]="activeId()"
          [ngModel]="term()"
          (ngModelChange)="onTermChange($event)"
          (focus)="open.set(true)"
          (keydown)="onKeydown($event)"
          [placeholder]="placeholder()"
        />
        @if (isOpen()) {
          <ul class="suggestions" id="suggest-list" role="listbox" aria-label="Suggestions">
            @for (s of suggestions(); track s.value; let i = $index) {
              <!-- ARIA combobox: focus stays on the input (aria-activedescendant); options
                   are not tab-focusable and keyboard selection is handled on the input.
                   Mouse click here is a pointer-only affordance. -->
              <!-- eslint-disable-next-line @angular-eslint/template/click-events-have-key-events, @angular-eslint/template/interactive-supports-focus -->
              <li
                class="suggestion"
                [class.active]="i === activeIndex()"
                role="option"
                [id]="'suggest-opt-' + i"
                [attr.aria-selected]="i === activeIndex()"
                (mousedown)="$event.preventDefault()"
                (click)="choose(s)"
              >
                @if (s.imageUrl) {
                  <img class="suggest-flag" [src]="s.imageUrl" alt="" loading="lazy" />
                }
                <span class="suggest-label" [innerHTML]="s.label"></span>
              </li>
            }
          </ul>
        }
      </div>
      @if (searching()) {
        <div class="search-status"><span class="spinner"></span> Searching…</div>
      }
      <small class="source-note">{{ note() }}</small>
    </div>
  `,
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent {
  readonly term = model.required<string>();
  readonly placeholder = input.required<string>();
  readonly note = input.required<string>();
  readonly searching = input.required<boolean>();
  /** Type-ahead candidates (empty when the active source has no suggestions). */
  readonly suggestions = input<Suggestion[]>([]);

  protected readonly open = signal(false);
  protected readonly activeIndex = signal(-1);

  /** The dropdown only shows when opened and there is something to show. */
  protected readonly isOpen = computed(() => this.open() && this.suggestions().length > 0);
  protected readonly activeId = computed(() => (this.activeIndex() >= 0 ? `suggest-opt-${this.activeIndex()}` : null));

  protected onTermChange(value: string): void {
    this.term.set(value);
    this.open.set(true);
    this.activeIndex.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const items = this.suggestions();
    switch (event.key) {
      case 'ArrowDown':
        if (!items.length) return;
        event.preventDefault();
        if (!this.open()) {
          this.open.set(true);
          return;
        }
        this.activeIndex.update(i => Math.min(items.length - 1, i + 1));
        break;
      case 'ArrowUp':
        if (!this.isOpen()) return;
        event.preventDefault();
        this.activeIndex.update(i => Math.max(0, i - 1));
        break;
      case 'Enter': {
        const i = this.activeIndex();
        if (this.isOpen() && i >= 0 && i < items.length) {
          event.preventDefault();
          this.choose(items[i]);
        }
        break;
      }
      case 'Escape':
        if (this.isOpen()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  protected choose(suggestion: Suggestion): void {
    this.term.set(suggestion.value);
    this.close();
  }

  protected close(): void {
    this.open.set(false);
    this.activeIndex.set(-1);
  }
}
