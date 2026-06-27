import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/** Monotonic id so each tip's bubble gets a unique id for aria-describedby. */
let nextTipId = 0;

/**
 * A small, reusable info tooltip: an ⓘ trigger that reveals projected content on
 * hover AND keyboard focus, and dismisses on Escape / blur / mouse-leave. The
 * trigger is a real (focusable) <button> wired to the bubble via aria-describedby,
 * so screen readers announce the explanation. Project the text as content:
 *
 *   <app-info-tip label="What is X?">X does Y.</app-info-tip>
 */
@Component({
  selector: 'app-info-tip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="info-tip" (mouseenter)="open.set(true)" (mouseleave)="open.set(false)">
      <button
        type="button"
        class="info-tip-trigger"
        [attr.aria-label]="label()"
        [attr.aria-expanded]="open()"
        [attr.aria-describedby]="open() ? tipId : null"
        (focus)="open.set(true)"
        (blur)="open.set(false)"
        (keydown.escape)="open.set(false)"
      >
        i
      </button>
      @if (open()) {
        <span class="info-tip-bubble" role="tooltip" [id]="tipId">
          <ng-content />
        </span>
      }
    </span>
  `,
  styleUrl: './info-tip.component.scss',
})
export class InfoTipComponent {
  /** Accessible name for the trigger button — describe what the tip explains. */
  readonly label = input('More information');

  protected readonly tipId = `info-tip-${nextTipId++}`;
  protected readonly open = signal(false);
}
