import { ChangeDetectionStrategy, Component, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type Density = 'comfortable' | 'compact';

/** Density / font-size / column-count controls. All three are two-way model bindings. */
@Component({
  selector: 'app-view-controls',
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="view-controls">
      <div class="control">
        <span class="control-label">View</span>
        <button type="button" class="chip" [class.active]="density() === 'comfortable'" (click)="density.set('comfortable')">
          Comfortable
        </button>
        <button type="button" class="chip" [class.active]="density() === 'compact'" (click)="density.set('compact')">Compact</button>
      </div>
      <div class="control">
        <span class="control-label">Font</span>
        <button type="button" class="chip" (click)="adjustFont(-0.1)" aria-label="Decrease font size">A−</button>
        <button type="button" class="chip" (click)="adjustFont(0.1)" aria-label="Increase font size">A+</button>
      </div>
      <div class="control" [class.disabled]="density() === 'compact'">
        <label class="control-label" for="columns">Columns</label>
        <select
          id="columns"
          class="select"
          [ngModel]="columns()"
          (ngModelChange)="columns.set(+$event)"
          [disabled]="density() === 'compact'"
          [title]="density() === 'compact' ? 'Columns apply to the comfortable grid only' : 'Number of columns'"
        >
          <option [ngValue]="0">Auto</option>
          <option [ngValue]="1">1</option>
          <option [ngValue]="2">2</option>
          <option [ngValue]="3">3</option>
          <option [ngValue]="4">4</option>
        </select>
      </div>
    </div>
  `,
  styleUrl: './view-controls.component.scss',
})
export class ViewControlsComponent {
  readonly density = model.required<Density>();
  readonly fontScale = model.required<number>();
  /** 0 means "auto" (auto-fill columns). */
  readonly columns = model.required<number>();

  protected adjustFont(delta: number): void {
    this.fontScale.update(value => Math.min(1.4, Math.max(0.8, +(value + delta).toFixed(2))));
  }
}
