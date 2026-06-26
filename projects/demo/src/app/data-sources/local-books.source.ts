import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DemoRecord, DemoSource } from './demo-source';

/** The original bundled dataset: 260+ programming books in English & Arabic. */
export const localBooksSource: DemoSource = {
  id: 'books',
  label: '📚 Local books',
  kind: 'local',
  searchPlaceholder: 'Fuzzy-search the books… (typos welcome!)',
  mapping: {
    keys: ['title', 'author', 'year'],
    titlePath: 'title',
    subtitlePath: 'author',
    metaPath: 'year',
  },
  load(http: HttpClient): Promise<DemoRecord[]> {
    return firstValueFrom(http.get<DemoRecord[]>('books.json'));
  },
};
