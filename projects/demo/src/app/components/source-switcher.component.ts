import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { DemoSource } from '../data-sources/demo-source';

/** Tab-style switcher between the available data sources. */
@Component({
  selector: 'app-source-switcher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="source-switch" role="group" aria-label="Data source">
      @for (source of sources(); track source.id) {
        <button type="button" class="chip" [class.active]="source === active()" (click)="sourceChange.emit(source)">
          {{ source.label }}
        </button>
      }
    </div>
  `,
  styleUrl: './source-switcher.component.scss',
})
export class SourceSwitcherComponent {
  readonly sources = input.required<readonly DemoSource[]>();
  readonly active = input.required<DemoSource>();
  readonly sourceChange = output<DemoSource>();
}
