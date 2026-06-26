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
  /**
   * Dot-path whose value is used directly as an image URL. Normally unset
   * (sources resolve images via `imageUrl()`); the introspection UI can set it
   * to override the cover with any field the data exposes.
   */
  imagePath?: string;
}

/** A single leaf field discovered by `flatten`, with a sample of its value. */
export interface FlatField {
  /** Dot-path to the value, e.g. "name.common". */
  path: string;
  /** A short, human-readable sample of the value at that path. */
  sample: string;
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
  /**
   * How an image (if any) should fill the card's cover slot.
   * `poster` (default) crops to a tall thumbnail; `flag` shows the whole wide image.
   */
  readonly imageStyle?: 'poster' | 'flag';
  /**
   * Opt in to the type-ahead suggestions dropdown (top matches by title).
   * Only worthwhile for small, local datasets where the whole list is in memory.
   */
  readonly suggestions?: boolean;
  /**
   * Optional user-supplied API key support. The key is held in memory only
   * (never persisted) and an empty value falls back to the source's default.
   */
  readonly apiKey?: {
    readonly label: string;
    readonly placeholder: string;
    readonly note: string;
    /** Store the supplied key; an empty string resets to the default. */
    set(key: string): void;
  };
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
 * Walk a dot-path (e.g. `name.common`) into a record and return the raw value.
 * The library's PropertyAccessor is private, so the demo keeps its own small
 * reader (this is the seed of the Phase 3 introspection helper).
 */
export function readPath(record: DemoRecord, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], record);
}

/**
 * Read a dot-path out of a record for display. Arrays are joined with ', ';
 * null/undefined become ''.
 */
export function valueAt(record: DemoRecord, path: string): string {
  const value = readPath(record, path);
  if (Array.isArray(value)) {
    return value.map(v => String(v ?? '')).join(', ');
  }
  return value === null || value === undefined ? '' : String(value);
}

/**
 * Flatten a record into the leaf dot-paths it exposes, each with a sample value.
 * Nested objects are recursed; arrays and primitives are treated as leaves
 * (matching how `valueAt` reads them). This powers the Phase 3 introspection UI.
 */
export function flatten(record: DemoRecord): FlatField[] {
  const out: FlatField[] = [];
  const walk = (value: unknown, prefix: string): void => {
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
        walk(child, prefix ? `${prefix}.${key}` : key);
      }
      return;
    }
    const sample = Array.isArray(value)
      ? value.map(v => String(v ?? '')).join(', ')
      : value === null || value === undefined
        ? ''
        : String(value);
    out.push({ path: prefix, sample });
  };
  walk(record, '');
  return out;
}
