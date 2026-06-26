import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DemoRecord, DemoSource, readPath } from './demo-source';

/**
 * Countries from a small bundled dataset (`public/countries.json`, a trimmed
 * derivative of mledoze/countries, ODbL — see `countries.NOTICE.md`).
 *
 * This is the "coarse fetch → pure client-side fuzzy search" showcase: the whole
 * list loads once, then every keystroke ranks it locally. It exercises the
 * library's nested keys (`name.common`, `name.official`) and the demo's Arabic
 * normalization (type "الاردن" and Jordan ranks first), and it opts into the
 * type-ahead suggestions dropdown.
 *
 * (REST Countries was the original plan, but v3/v4 are deprecated and v5 now
 * requires an API key — unusable on a keyless static site — so the data ships
 * with the demo instead, which is a better fit for a local-search showcase.)
 */
export const countriesSource: DemoSource = {
  id: 'countries',
  label: '🏳️ Countries',
  kind: 'local',
  searchPlaceholder: 'Search countries… try "jordan", "الاردن", or a capital',
  note: 'Bundled offline dataset (mledoze/countries, ODbL) — fuzzy-ranked locally. Type a name in English or Arabic.',
  imageStyle: 'flag',
  suggestions: true,
  mapping: {
    keys: ['name.common', 'name.official', 'name.arabic', 'capital', 'region', 'subregion'],
    titlePath: 'name.common',
    subtitlePath: 'capital',
    metaPath: 'region',
  },
  async load(http: HttpClient): Promise<DemoRecord[]> {
    return firstValueFrom(http.get<DemoRecord[]>('countries.json'));
  },
  imageUrl(record: DemoRecord): string | undefined {
    const cca2 = readPath(record, 'cca2');
    return typeof cca2 === 'string' && cca2 ? `https://flagcdn.com/w320/${cca2}.png` : undefined;
  },
};
