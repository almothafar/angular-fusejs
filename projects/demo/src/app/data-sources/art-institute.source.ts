import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { DemoRecord, DemoSource } from './demo-source';

interface ArtworksResponse {
  data?: {
    id?: number;
    title?: string;
    artist_display?: string;
    date_display?: string;
    medium_display?: string;
  }[];
}

/**
 * Artworks from the keyless, CORS-enabled Art Institute of Chicago API
 * (fetch-as-you-type). Rich text metadata — title, artist, date, medium — makes
 * a strong fuzzy-search target.
 *
 * Images are intentionally omitted: the museum's IIIF image host (www.artic.edu)
 * sits behind a Cloudflare challenge that blocks hotlinked <img> requests, so
 * every card would fall back to the placeholder. The detail link (a real browser
 * navigation, which can pass the challenge) still opens the artwork's page.
 */
export const artInstituteSource: DemoSource = {
  id: 'art',
  label: '🎨 Art Institute',
  kind: 'remote',
  searchPlaceholder: 'Search the Art Institute of Chicago… fetches as you type',
  note: 'Live from the Art Institute of Chicago, fuzzy-ranked & highlighted locally. Try “monet”, “mask”, or “self portrait”.',
  mapping: {
    keys: ['title', 'artist', 'date', 'medium'],
    titlePath: 'title',
    subtitlePath: 'artist',
    metaPath: 'date',
  },
  async load(http: HttpClient, query = ''): Promise<DemoRecord[]> {
    if (!query.trim()) {
      return [];
    }
    const url =
      `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}` +
      '&fields=id,title,artist_display,date_display,medium_display&limit=50';
    const res = await firstValueFrom(http.get<ArtworksResponse>(url));
    return (res.data ?? []).map<DemoRecord>(art => ({
      id: art.id ?? '',
      title: art.title ?? '',
      artist: art.artist_display ?? '',
      date: art.date_display ?? '',
      medium: art.medium_display ?? '',
    }));
  },
  detailUrl(record: DemoRecord): string | undefined {
    const id = record['id'];
    return typeof id === 'number' && id ? `https://www.artic.edu/artworks/${id}` : undefined;
  },
};
