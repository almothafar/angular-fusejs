import { Component, signal, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularFuseJsResult, AngularFuseJsService } from '@almothafar/angular-fusejs';
import { BUILD_INFO } from './build-info';
import { DemoRecord, DemoSource, valueAt } from './data-sources/demo-source';
import { localBooksSource } from './data-sources/local-books.source';
import { openLibrarySource } from './data-sources/open-library.source';

type DemoResult = AngularFuseJsResult<DemoRecord>;

/** What the template renders for a single result — display is driven by the active source's mapping. */
interface CardVM {
  id: string;
  /** May contain highlight <em> markup, so it is bound via [innerHTML]. */
  title: string;
  subtitle: string;
  meta: string;
  matchPercent: number | null;
  lang: string | null;
}

/** When there is no search term we show a capped sample instead of the whole dataset. */
const EMPTY_SAMPLE_SIZE = 24;

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private fuseService = new AngularFuseJsService<DemoRecord>();

  protected readonly title = signal('Angular FuseJS Demo');
  protected readonly buildTime = BUILD_INFO.timestamp;

  // --- Data sources -------------------------------------------------------
  protected readonly sources: readonly DemoSource[] = [localBooksSource, openLibrarySource];
  protected readonly activeSource = signal<DemoSource>(this.sources[0]);

  protected readonly searchTerm = signal('');
  protected readonly seedQuery = signal('');
  protected readonly items = signal<DemoRecord[]>([]);
  protected readonly loading = signal(false);
  protected readonly loadError = signal<string | null>(null);

  // --- View controls ------------------------------------------------------
  protected readonly density = signal<'comfortable' | 'compact'>('comfortable');
  protected readonly fontScale = signal(1);
  /** 0 means "auto" (auto-fill columns). */
  protected readonly columns = signal(0);

  ngOnInit(): void {
    void this.reload();
  }

  protected selectSource(source: DemoSource): void {
    if (source === this.activeSource()) {
      return;
    }
    this.activeSource.set(source);
    this.searchTerm.set('');
    this.seedQuery.set('');
    void this.reload();
  }

  protected async reload(): Promise<void> {
    const source = this.activeSource();
    this.loading.set(true);
    this.loadError.set(null);
    try {
      const data = await source.load(this.http, this.seedQuery() || undefined);
      this.items.set(data);
    } catch {
      this.items.set([]);
      this.loadError.set('Could not load data. Check your connection and try again.');
    } finally {
      this.loading.set(false);
    }
  }

  protected adjustFont(delta: number): void {
    this.fontScale.update(value => Math.min(1.4, Math.max(0.8, +(value + delta).toFixed(2))));
  }

  protected readonly totalCount = computed(() => this.items().length);

  /** Raw Fuse results, or a capped sample of the dataset when there is no search term. */
  private readonly results = computed<DemoResult[]>(() => {
    const term = this.searchTerm();
    const list = this.items();
    if (!term) {
      return list.slice(0, EMPTY_SAMPLE_SIZE) as DemoResult[];
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
    const mapping = this.activeSource().mapping;
    const hasTerm = !!this.searchTerm();
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
