import { Injectable } from '@angular/core';
import Fuse, { FuseResult, IFuseOptions } from 'fuse.js';

/**
 * Extended options for Angular FuseJS with highlight support
 */
export interface AngularFuseJsOptions<T> extends IFuseOptions<T> {
  /** Enable highlight support for search results */
  supportHighlight?: boolean;
  /** Key name for highlighted results */
  fuseJsHighlightKey?: string;
  /** Key name for storing match score */
  fuseJsScoreKey?: string;
  /** Minimum search term length before performing search */
  minSearchTermLength?: number;
  /** Maximum score threshold for filtering results */
  maximumScore?: number;
  /** HTML tag to use for highlighting (default: 'em') */
  highlightTag?: string;
}

/**
 * Result type with highlighting and score information
 * Supports both default keys and custom keys for type-safe access
 *
 * @template T - The base item type
 * @template HighlightKey - Key name for highlighted results (default: 'fuseJsHighlighted')
 * @template ScoreKey - Key name for match score (default: 'fuseJsScore')
 *
 * @example
 * ```typescript
 * // Default keys
 * type BookResult = AngularFuseJsResult<Book>;
 * // bookResult.fuseJsHighlighted and bookResult.fuseJsScore
 *
 * // Custom keys
 * type CustomBookResult = AngularFuseJsResult<Book, 'highlighted', 'score'>;
 * // bookResult.highlighted and bookResult.score
 * ```
 */
export type AngularFuseJsResult<T, HighlightKey extends string = 'fuseJsHighlighted', ScoreKey extends string = 'fuseJsScore'> = T &
  Partial<Record<HighlightKey, T>> &
  Partial<Record<ScoreKey, number>>;

/**
 * Helper functions for deep property access without lodash
 */
class PropertyAccessor {
  /**
   * Get nested property value from object using dot notation
   * e.g., get(obj, 'user.name') or get(obj, 'items[0].title')
   */
  static get<T>(obj: T, path: string): unknown {
    const keys = path.replace(/\[(\d+)]/g, '.$1').split('.');
    return keys.reduce((acc: unknown, key) => {
      return (acc as Record<string, unknown>)?.[key];
    }, obj as unknown);
  }

  /**
   * Set nested property value in object using dot notation
   * e.g., set(obj, 'user.name', 'John') or set(obj, 'items[0].title', 'Title')
   */
  static set<T>(obj: T, path: string, value: unknown): void {
    const keys = path.replace(/\[(\d+)]/g, '.$1').split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce(
      (acc: Record<string, unknown>, key) => {
        const current = acc[key];
        if (!current || typeof current !== 'object') {
          acc[key] = {};
        }
        return acc[key] as Record<string, unknown>;
      },
      obj as Record<string, unknown>,
    );
    target[lastKey] = value;
  }
}

/**
 * Modern Angular service for Fuse.js integration with highlight support
 *
 * @example
 * ```typescript
 * const results = service.searchList(
 *   books,
 *   'search term',
 *   { keys: ['title', 'author'], supportHighlight: true }
 * );
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class AngularFuseJsService<T = unknown> {
  /**
   * Default search options
   */
  readonly defaultOptions: AngularFuseJsOptions<T> = {
    supportHighlight: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    minSearchTermLength: 3,
    fuseJsHighlightKey: 'fuseJsHighlighted',
    fuseJsScoreKey: 'fuseJsScore',
  };

  /**
   * Search through a list using Fuse.js with optional highlighting
   *
   * @param list - Array of items to search through
   * @param searchTerms - Search query string
   * @param options - Search options (merged with defaults)
   * @returns Array of search results (with highlights if enabled)
   *
   * @example
   * ```typescript
   * // With custom keys - type-safe access
   * const results = service.searchList(books, 'search', {
   *   keys: ['title'],
   *   supportHighlight: true,
   *   fuseJsHighlightKey: 'highlighted',
   *   fuseJsScoreKey: 'score',
   * } as const);
   * // Now you can use: results[0].highlighted and results[0].score
   * ```
   */
  searchList<HighlightKey extends string = 'fuseJsHighlighted', ScoreKey extends string = 'fuseJsScore'>(
    list: T[],
    searchTerms: string,
    options?: AngularFuseJsOptions<T> & {
      fuseJsHighlightKey?: HighlightKey;
      fuseJsScoreKey?: ScoreKey;
    },
  ): AngularFuseJsResult<T, HighlightKey, ScoreKey>[] {
    const fuseOptions: AngularFuseJsOptions<T> = { ...this.defaultOptions, ...options };

    // Return original list if search term is too short
    if (!searchTerms || searchTerms.length < (fuseOptions.minSearchTermLength ?? 0)) {
      return this.handleEmptySearch(list, fuseOptions) as AngularFuseJsResult<T, HighlightKey, ScoreKey>[];
    }

    // Enable matches for highlighting
    if (fuseOptions.supportHighlight) {
      fuseOptions.includeMatches = true;
    }

    // Perform search
    const fuse = new Fuse(list, fuseOptions);
    const results = fuse.search(searchTerms);

    // Apply highlighting if enabled
    if (fuseOptions.supportHighlight) {
      return this.handleHighlight(results, fuseOptions) as AngularFuseJsResult<T, HighlightKey, ScoreKey>[];
    }

    // Return just the items without FuseResult wrapper
    return results.map(result => result.item) as AngularFuseJsResult<T, HighlightKey, ScoreKey>[];
  }

  /**
   * Handle case when the search term is empty or too short
   */
  private handleEmptySearch(list: T[], options: AngularFuseJsOptions<T>): AngularFuseJsResult<T>[] {
    const clonedList = this.deepClone(list) as AngularFuseJsResult<T>[];

    if (options.supportHighlight) {
      clonedList.forEach(element => {
        (element as Record<string, unknown>)[options.fuseJsHighlightKey || '_'] = this.deepClone(element);
      });
    }

    return clonedList;
  }

  /**
   * Add highlight markup to search results
   */
  private handleHighlight(results: FuseResult<T>[], options: AngularFuseJsOptions<T>): AngularFuseJsResult<T>[] {
    // Filter by maximum score if specified
    if (options.maximumScore !== undefined && options.includeScore) {
      results = results.filter(result => result.score !== undefined && result.score <= (options.maximumScore ?? 0));
    }

    return results.map(matchObject => {
      const item = this.deepClone(matchObject.item) as AngularFuseJsResult<T>;
      const itemRecord = item as unknown as Record<string, unknown>;
      const highlightKey = options.fuseJsHighlightKey || '_';
      const scoreKey = options.fuseJsScoreKey || '_';

      // Store highlighted version and score
      itemRecord[highlightKey] = this.deepClone(item);
      itemRecord[scoreKey] = matchObject.score;

      // Process matches
      if (matchObject.matches) {
        for (const match of matchObject.matches) {
          if (!match.indices || !match.key) continue;

          let key = match.key as string;

          // Handle array indices
          const arrayIndex = (match as Record<string, unknown>)['arrayIndex'];
          if (arrayIndex !== undefined) {
            const value = PropertyAccessor.get(itemRecord[highlightKey], key);
            if (Array.isArray(value)) {
              key += `[${arrayIndex}]`;
            }
          }

          // Apply highlighting to matched indices
          let highlightOffset = 0;
          const tagStart = `<${options.highlightTag ?? 'em'}>`;
          const tagEnd = `</${options.highlightTag ?? 'em'}>`;

          for (const [start, end] of match.indices) {
            let currentValue = PropertyAccessor.get(itemRecord[highlightKey], key);

            // Convert numbers to strings for highlighting
            if (typeof currentValue === 'number') {
              currentValue = String(currentValue);
              PropertyAccessor.set(itemRecord[highlightKey], key, currentValue);
            }

            if (typeof currentValue !== 'string') {
              continue;
            }

            const startOffset = start + highlightOffset;
            const endOffset = end + highlightOffset + 1;
            const highlightedTerm = currentValue.substring(startOffset, endOffset);
            const newValue =
              currentValue.substring(0, startOffset) + tagStart + highlightedTerm + tagEnd + currentValue.substring(endOffset);

            highlightOffset += tagStart.length + tagEnd.length;
            PropertyAccessor.set(itemRecord[highlightKey], key, newValue);
          }
        }
      }

      return item;
    });
  }

  /**
   * Deep clone an object using native JavaScript (no lodash needed)
   */
  private deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.deepClone(item)) as T;
    }

    const cloned = {} as Record<string, unknown>;
    for (const key in obj) {
      if (Object.hasOwn(obj, key)) {
        cloned[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      }
    }

    return cloned as T;
  }
}
