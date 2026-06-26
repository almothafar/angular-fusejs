import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** The unified search field, plus an inline "searching…" status and a per-source note. */
@Component({
  selector: 'app-search-bar',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-row">
      <input
        id="demo-search"
        name="search"
        type="text"
        class="search-input"
        [ngModel]="term()"
        (ngModelChange)="term.set($event)"
        [placeholder]="placeholder()"
      />
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
}
