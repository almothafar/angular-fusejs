import { HttpClient } from '@angular/common/http';

/** A single record from a data source. The concrete shape varies per source. */
export type DemoRecord = Record<string, unknown>;

/** Maps a source's record shape onto what the card UI and Fuse.js need. */
export interface FieldMapping {
  /** Dot-paths handed to Fuse.js as search keys. */
  keys: string[];
  /** Dot-path to the card's primary line. */
  titlePath: string;
  /** Dot-path to the card's secondary line. */
  subtitlePath?: string;
  /** Dot-path to a small meta value (year, region, ...). */
  metaPath?: string;
}

/** A switchable demo data source — either a local array or a remote fetch. */
export interface DemoSource {
  readonly id: string;
  readonly label: string;
  /** `local` ignores the query; `remote` fetches using it (as-you-type, debounced). */
  readonly kind: 'local' | 'remote';
  /** Placeholder for the unified search field. */
  readonly searchPlaceholder: string;
  /** Short note shown under the search field (always present, so switching sources doesn't shift layout). */
  readonly note: string;
  readonly mapping: FieldMapping;
  /** Load the dataset. `query` drives remote sources; local sources ignore it. */
  load(http: HttpClient, query?: string): Promise<DemoRecord[]>;
  /** Resolve a record's image URL, if any (used from Phase 2 onward). */
  imageUrl?(record: DemoRecord): string | undefined;
  /**
   * Resolve a record's external detail page, if any (opens in a new tab).
   * Sources without trustworthy links (e.g. AI-generated local data) omit this.
   */
  detailUrl?(record: DemoRecord): string | undefined;
}

/**
 * Read a dot-path out of a record for display. Arrays are joined with ', ';
 * null/undefined become ''. The library's PropertyAccessor is private, so the
 * demo keeps its own small reader (this is the seed of the Phase 3 introspection).
 */
export function valueAt(record: DemoRecord, path: string): string {
  const value = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], record);
  if (Array.isArray(value)) {
    return value.map(v => String(v ?? '')).join(', ');
  }
  return value === null || value === undefined ? '' : String(value);
}
