import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
import { AngularFuseJsResult, AngularFuseJsService } from '@almothafar/angular-fusejs';
import { BUILD_INFO } from './build-info';
import { DemoRecord, DemoSource, valueAt } from './data-sources/demo-source';
import { localBooksSource } from './data-sources/local-books.source';
import { openLibrarySource } from './data-sources/open-library.source';
import { SourceSwitcherComponent } from './components/source-switcher.component';
import { ViewControlsComponent } from './components/view-controls.component';
import { SearchBarComponent } from './components/search-bar.component';
import { CardVM, ResultCardComponent } from './components/result-card.component';

type DemoResult = AngularFuseJsResult<DemoRecord>;

/** How long to wait after the user stops typing before a remote source fetches. */
const REMOTE_DEBOUNCE_MS = 800;

/** Minimum characters before a remote source will fetch. */
const MIN_REMOTE_QUERY_LENGTH = 3;

@Component({
  selector: 'app-root',
  imports: [DatePipe, SourceSwitcherComponent, ViewControlsComponent, SearchBarComponent, ResultCardComponent],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private fuseService = new AngularFuseJsService<DemoRecord>();
  /** Monotonic load counter — only the latest load may mutate state (discards stale responses). */
  private requestSeq = 0;

  protected readonly title = signal('Angular FuseJS Demo');
  protected readonly buildTime = BUILD_INFO.timestamp;

  // --- Data sources -------------------------------------------------------
  protected readonly sources: readonly DemoSource[] = [localBooksSource, openLibrarySource];
  protected readonly activeSource = signal<DemoSource>(this.sources[0]);

  protected readonly searchTerm = signal('');
  protected readonly items = signal<DemoRecord[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);
  /** The query whose results are currently loaded (for remote sources). */
  protected readonly loadedQuery = signal<string | null>(null);

  // --- View controls (two-way bound into <app-view-controls>) -------------
  protected readonly density = signal<'comfortable' | 'compact'>('comfortable');
  protected readonly fontScale = signal(1);
  /** 0 means "auto" (auto-fill columns). Ignored in compact mode. */
  protected readonly columns = signal(0);

  /** Minimum characters before a remote source fetches (exposed to the template). */
  protected readonly minRemoteChars = MIN_REMOTE_QUERY_LENGTH;

  constructor() {
    // Remote sources fetch as you type: debounced, only on change, only while a remote source is active.
    toObservable(this.searchTerm)
      .pipe(
        map(term => term.trim()),
        debounceTime(REMOTE_DEBOUNCE_MS),
        distinctUntilChanged(),
        filter(() => this.activeSource().kind === 'remote'),
        takeUntilDestroyed(),
      )
      .subscribe(term => {
        if (term.length >= MIN_REMOTE_QUERY_LENGTH) {
          void this.loadFrom(term);
        } else {
          // Below the threshold: invalidate any in-flight load and reset to the prompt.
          this.requestSeq++;
          this.loading.set(false);
          this.items.set([]);
          this.loadError.set(null);
          this.loadedQuery.set(null);
        }
      });
  }

  ngOnInit(): void {
    // Default source is local books — load the full set immediately.
    void this.loadFrom(undefined);
  }

  protected selectSource(source: DemoSource): void {
    if (source === this.activeSource()) {
      return;
    }
    this.activeSource.set(source);
    this.searchTerm.set('');
    this.loadError.set(null);
    this.loadedQuery.set(null);
    if (source.kind === 'local') {
      void this.loadFrom(undefined);
    } else {
      // Remote: invalidate any in-flight load and wait for the user to type (no prefetch).
      this.requestSeq++;
      this.loading.set(false);
      this.items.set([]);
    }
  }

  private async loadFrom(query: string | undefined): Promise<void> {
    const source = this.activeSource();
    const seq = ++this.requestSeq;
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const data = await source.load(this.http, query);
      if (seq !== this.requestSeq) {
        return; // a newer load (or a source switch) superseded this one — discard
      }
      this.items.set(data);
    } catch {
      if (seq !== this.requestSeq) {
        return;
      }
      this.items.set([]);
      this.loadError.set('Could not load data. Check your connection and try again.');
    } finally {
      // Only the latest load settles the shared loading/searching state.
      if (seq === this.requestSeq) {
        this.loading.set(false);
        this.loadedQuery.set(query ?? null);
      }
    }
  }

  protected readonly totalCount = computed(() => this.items().length);

  /** Remote source with nothing loaded yet and not enough characters typed — prompt the user. */
  protected readonly awaitingRemoteInput = computed(
    () => this.activeSource().kind === 'remote' && this.items().length === 0 && this.searchTerm().trim().length < MIN_REMOTE_QUERY_LENGTH,
  );

  /**
   * True while a fetch is in flight OR a remote query (≥ min length) has been typed but not yet
   * fetched — covers the debounce window so the user gets immediate feedback.
   */
  protected readonly searching = computed(() => {
    if (this.loading()) {
      return true;
    }
    const term = this.searchTerm().trim();
    return this.activeSource().kind === 'remote' && term.length >= MIN_REMOTE_QUERY_LENGTH && term !== this.loadedQuery();
  });

  /** Raw Fuse results, or the whole loaded dataset when there is no search term. */
  private readonly results = computed<DemoResult[]>(() => {
    const term = this.searchTerm().trim();
    const list = this.items();
    if (!term) {
      // Show everything (the results box scrolls) — no cap, no pagination.
      return list as DemoResult[];
    }
    return this.fuseService.searchList(list, term, {
      keys: this.activeSource().mapping.keys,
      supportHighlight: true,
      threshold: 0.4,
      minSearchTermLength: 2,
      includeScore: true,
      // Normalize Arabic text before matching (alef/ta-marbuta variants + tashkeel).
      getFn: (obj: DemoRecord, path: string | string[]): string => {
        const keys = Array.isArray(path) ? path : [path];
        let value: unknown = obj;
        for (const key of keys) {
          value = (value as Record<string, unknown>)?.[key];
        }
        return this.normalizeArabicText(String(value ?? ''));
      },
    });
  });

  /** View models for the template, projected through the active source's mapping. */
  protected readonly cards = computed<CardVM[]>(() => {
    const source = this.activeSource();
    const mapping = source.mapping;
    const hasTerm = !!this.searchTerm().trim();
    // Only sources that resolve images get a cover slot; '' within that means "use the placeholder".
    const resolveImage = source.imageUrl;
    return this.results().map((result, index) => {
      const highlighted = (result.fuseJsHighlighted ?? result) as DemoRecord;
      const score = result.fuseJsScore;
      const lang = result['language'];
      return {
        id: `${index}:${valueAt(result, mapping.titlePath)}`,
        title: valueAt(highlighted, mapping.titlePath),
        subtitle: mapping.subtitlePath ? valueAt(highlighted, mapping.subtitlePath) : '',
        meta: mapping.metaPath ? valueAt(highlighted, mapping.metaPath) : '',
        matchPercent: hasTerm && score !== undefined ? Math.round((1 - score) * 100) : null,
        lang: typeof lang === 'string' ? lang : null,
        imageUrl: resolveImage ? (resolveImage(result) ?? '') : null,
      };
    });
  });

  /**
   * Normalizes Arabic text for better fuzzy search matching
   * - Converts alef variations (أ, إ, آ) to plain alef (ا)
   * - Converts ta marbuta (ة) to ha (ه)
   * - Removes Arabic diacritics (tashkeel)
   */
  private normalizeArabicText(text: string): string {
    return text.replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ً-ٟ]/g, '');
  }
}
