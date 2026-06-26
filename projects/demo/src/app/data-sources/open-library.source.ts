import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DemoRecord, DemoSource } from './demo-source';

interface OpenLibraryResponse {
  docs?: {
    title?: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
  }[];
}

/**
 * Remote books from the keyless, CORS-enabled Open Library search API.
 * Fetch-as-you-type: each (debounced) query loads up to 100 books, then the
 * library fuzzy-highlights/ranks them locally — proving it works on remote data.
 */
export const openLibrarySource: DemoSource = {
  id: 'open-library',
  label: '🌐 Open Library',
  kind: 'remote',
  searchPlaceholder: 'Search Open Library… fetches as you type',
  note: 'Results are fetched live from Open Library, then fuzzy-ranked & highlighted by the library.',
  mapping: {
    keys: ['title', 'author', 'year'],
    titlePath: 'title',
    subtitlePath: 'author',
    metaPath: 'year',
  },
  async load(http: HttpClient, query = ''): Promise<DemoRecord[]> {
    if (!query.trim()) {
      return [];
    }
    const url =
      `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}` +
      '&limit=100&fields=title,author_name,first_publish_year,cover_i';
    const res = await firstValueFrom(http.get<OpenLibraryResponse>(url));
    return (res.docs ?? []).map<DemoRecord>(doc => ({
      title: doc.title ?? '',
      author: (doc.author_name ?? []).join(', '),
      year: doc.first_publish_year ?? '',
      cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : '',
    }));
  },
  imageUrl(record: DemoRecord): string | undefined {
    const cover = record['cover'];
    return typeof cover === 'string' && cover ? cover : undefined;
  },
};
