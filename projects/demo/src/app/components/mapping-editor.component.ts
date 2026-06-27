import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { FieldMapping, FlatField } from '../data-sources/demo-source';
import { InfoTipComponent } from './info-tip.component';

/**
 * Introspection UI: shows the field paths discovered in the loaded data, lets the
 * user pick which ones Fuse searches (checkboxes) and which drive the card display
 * (title / subtitle / meta / image selects), and re-ranks live. Emits the full
 * mapping on every change; `null` means "reset to the source default".
 */
@Component({
  selector: 'app-mapping-editor',
  imports: [InfoTipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="field-editor">
      <div class="fe-header">
        <button type="button" class="fe-toggle" (click)="open.set(!open())" [attr.aria-expanded]="open()">
          <span class="fe-caret" [class.open]="open()" aria-hidden="true">▸</span>
          Customize search fields
          <span class="fe-count">{{ mapping().keys.length }} of {{ fields().length }} keys</span>
        </button>
        <app-info-tip label="What does customizing search fields do?">
          Choose which fields Fuse.js fuzzy-searches and what each result card shows (title, subtitle, meta, image). Changes re-rank the
          results instantly.
        </app-info-tip>
      </div>

      @if (open()) {
        <div class="fe-body">
          <fieldset class="fe-keys">
            <legend>Fuzzy-search keys</legend>
            @for (f of fields(); track f.path) {
              <label class="fe-key" [class.checked]="isKey(f.path)">
                <input type="checkbox" [checked]="isKey(f.path)" (change)="toggleKey(f.path)" />
                <span class="fe-path">{{ f.path }}</span>
                @if (f.sample) {
                  <span class="fe-sample">{{ f.sample }}</span>
                }
              </label>
            }
          </fieldset>

          <div class="fe-display">
            <label class="fe-select">
              <span>Title</span>
              <select #titleSel (change)="setTitle(titleSel.value)">
                @for (f of fields(); track f.path) {
                  <option [value]="f.path" [selected]="f.path === mapping().titlePath">{{ f.path }}</option>
                }
              </select>
            </label>

            <label class="fe-select">
              <span>Subtitle</span>
              <select #subSel (change)="setOptional('subtitlePath', subSel.value)">
                <option value="" [selected]="!mapping().subtitlePath">(none)</option>
                @for (f of fields(); track f.path) {
                  <option [value]="f.path" [selected]="f.path === mapping().subtitlePath">{{ f.path }}</option>
                }
              </select>
            </label>

            <label class="fe-select">
              <span>Meta</span>
              <select #metaSel (change)="setOptional('metaPath', metaSel.value)">
                <option value="" [selected]="!mapping().metaPath">(none)</option>
                @for (f of fields(); track f.path) {
                  <option [value]="f.path" [selected]="f.path === mapping().metaPath">{{ f.path }}</option>
                }
              </select>
            </label>

            <label class="fe-select">
              <span>Image</span>
              <select #imgSel (change)="setOptional('imagePath', imgSel.value)">
                <option value="" [selected]="!mapping().imagePath">(source default)</option>
                @for (f of fields(); track f.path) {
                  <option [value]="f.path" [selected]="f.path === mapping().imagePath">{{ f.path }}</option>
                }
              </select>
            </label>

            @if (canReset()) {
              <button type="button" class="fe-reset" (click)="reset()">Reset to default</button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './mapping-editor.component.scss',
})
export class MappingEditorComponent {
  /** Leaf paths discovered in the loaded data sample. */
  readonly fields = input.required<FlatField[]>();
  /** The mapping currently in effect (source default or a prior override). */
  readonly mapping = input.required<FieldMapping>();
  /** The source's default mapping, used only to decide whether "Reset" is meaningful. */
  readonly defaultMapping = input.required<FieldMapping>();
  /** Emits the new mapping on every change; `null` requests a reset to the source default. */
  readonly mappingChange = output<FieldMapping | null>();

  protected readonly open = signal(false);

  /** A reset only matters once the effective mapping differs from the source default. */
  protected readonly canReset = computed(() => this.mapping() !== this.defaultMapping());

  protected isKey(path: string): boolean {
    return this.mapping().keys.includes(path);
  }

  protected toggleKey(path: string): void {
    const mapping = this.mapping();
    const has = mapping.keys.includes(path);
    const keys = has ? mapping.keys.filter(k => k !== path) : [...mapping.keys, path];
    // Keep at least one search key — Fuse needs something to match on.
    if (keys.length === 0) {
      return;
    }
    this.mappingChange.emit({ ...mapping, keys });
  }

  protected setTitle(path: string): void {
    this.mappingChange.emit({ ...this.mapping(), titlePath: path });
  }

  protected setOptional(field: 'subtitlePath' | 'metaPath' | 'imagePath', path: string): void {
    this.mappingChange.emit({ ...this.mapping(), [field]: path || undefined });
  }

  protected reset(): void {
    this.mappingChange.emit(null);
  }
}
