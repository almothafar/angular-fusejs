import { AngularFuseJsService } from '@almothafar/angular-fusejs';
import { countriesSource } from './countries.source';
import { DemoRecord, readPath } from './demo-source';

/**
 * Proves the core Slice A capability — fuzzy search over *nested* keys
 * (`name.common`, `capital`) using the same join-then-split getFn the app uses.
 * Framework-light: drives the library service directly, no TestBed/browser.
 */
describe('countries fuzzy search (nested keys)', () => {
  const data: DemoRecord[] = [
    {
      name: { common: 'Jordan', official: 'Hashemite Kingdom of Jordan', arabic: 'الأردن' },
      capital: ['Amman'],
      region: 'Asia',
      cca2: 'jo',
    },
    { name: { common: 'Japan', official: 'Japan', arabic: 'اليابان' }, capital: ['Tokyo'], region: 'Asia', cca2: 'jp' },
    { name: { common: 'France', official: 'French Republic', arabic: 'فرنسا' }, capital: ['Paris'], region: 'Europe', cca2: 'fr' },
  ];

  const service = new AngularFuseJsService<DemoRecord>();
  const search = (term: string): DemoRecord[] =>
    service.searchList(data, term, {
      keys: countriesSource.mapping.keys,
      threshold: 0.4,
      minSearchTermLength: 2,
      includeScore: true,
      getFn: (obj, path) => {
        const dotted = (Array.isArray(path) ? path : [path]).join('.');
        const value = readPath(obj as DemoRecord, dotted);
        return Array.isArray(value) ? value.join(' ') : String(value ?? '');
      },
    });

  it('ranks the country matched on nested name.common first', () => {
    const top = search('jordan')[0];
    expect(readPath(top, 'name.common')).toBe('Jordan');
  });

  it('matches on the capital (array) key', () => {
    const top = search('tokyo')[0];
    expect(readPath(top, 'name.common')).toBe('Japan');
  });

  it('tolerates a fuzzy/misspelled query', () => {
    const top = search('frnace')[0];
    expect(readPath(top, 'name.common')).toBe('France');
  });
});
