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
 * Coarse-fetch model: one query loads up to 100 books, then all fuzzy
 * searching happens locally via the library — proving it works on remote data.
 */
export const openLibrarySource: DemoSource = {
  id: 'open-library',
  label: '🌐 Open Library',
  kind: 'remote',
  seedPlaceholder: 'Seed query to fetch, e.g. "tolkien", "javascript", "history"',
  mapping: {
    keys: ['title', 'author', 'year'],
    titlePath: 'title',
    subtitlePath: 'author',
    metaPath: 'year',
  },
  async load(http: HttpClient, query = 'programming'): Promise<DemoRecord[]> {
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
