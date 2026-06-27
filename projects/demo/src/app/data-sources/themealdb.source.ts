import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DemoRecord, DemoSource } from './demo-source';

interface MealDbResponse {
  meals?:
    | {
        idMeal?: string;
        strMeal?: string;
        strCategory?: string;
        strArea?: string;
        strMealThumb?: string;
      }[]
    | null;
}

/** Free public test key — works for everyone with no registration. */
const TEST_KEY = '1';

/**
 * In-memory only: replaced if the visitor pastes a premium key, never persisted.
 * Lives in the module closure so `load` can read it without widening the contract.
 */
let apiKey = TEST_KEY;

/**
 * Recipes from the keyless, CORS-enabled TheMealDB search API (fetch-as-you-type).
 * Inherently family-safe. Demonstrates the optional bring-your-own-key UX: a premium
 * key can be supplied at runtime (in memory only) and the free test key is the default.
 */
export const theMealDbSource: DemoSource = {
  id: 'recipes',
  label: '🍲 Recipes',
  kind: 'remote',
  searchPlaceholder: 'Search recipes by name… fetches as you type',
  note: 'Live from TheMealDB, fuzzy-ranked & highlighted locally. Family-friendly recipes.',
  imageStyle: 'poster',
  apiKey: {
    label: 'TheMealDB premium key (optional)',
    placeholder: 'Paste a premium key, or leave blank for the free test data',
    note: 'Optional. Held in memory only — never stored, and sent only to TheMealDB. Blank uses the free test key.',
    set(key: string): void {
      apiKey = key.trim() || TEST_KEY;
    },
  },
  mapping: {
    keys: ['strMeal', 'strCategory', 'strArea'],
    titlePath: 'strMeal',
    subtitlePath: 'strArea',
    metaPath: 'strCategory',
  },
  async load(http: HttpClient, query = ''): Promise<DemoRecord[]> {
    if (!query.trim()) {
      return [];
    }
    const url = `https://www.themealdb.com/api/json/v1/${encodeURIComponent(apiKey)}/search.php?s=${encodeURIComponent(query)}`;
    const res = await firstValueFrom(http.get<MealDbResponse>(url));
    return (res.meals ?? []).map<DemoRecord>(meal => ({
      id: meal.idMeal ?? '',
      strMeal: meal.strMeal ?? '',
      strCategory: meal.strCategory ?? '',
      strArea: meal.strArea ?? '',
      thumb: meal.strMealThumb ?? '',
    }));
  },
  imageUrl(record: DemoRecord): string | undefined {
    const thumb = record['thumb'];
    return typeof thumb === 'string' && thumb ? thumb : undefined;
  },
  detailUrl(record: DemoRecord): string | undefined {
    const id = record['id'];
    return typeof id === 'string' && id ? `https://www.themealdb.com/meal/${id}` : undefined;
  },
};
