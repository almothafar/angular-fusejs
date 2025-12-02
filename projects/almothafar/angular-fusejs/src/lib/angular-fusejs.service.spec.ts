import { TestBed } from '@angular/core/testing';
import { AngularFuseJsService } from './angular-fusejs.service';

interface Book {
  id: number;
  title: string;
  author: string;
}

describe('AngularFuseJsService', () => {
  let service: AngularFuseJsService<Book>;

  const mockData = [
    { id: 1, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { id: 2, title: 'Clean Code', author: 'Robert Martin' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Hunt and Thomas' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AngularFuseJsService],
    });
    service = TestBed.inject(AngularFuseJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search and return matching results', () => {
    const results = service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('JavaScript');
  });

  it('should return empty array when search term is too short', () => {
    const results = service.searchList(mockData, 'ab', {
      keys: ['title'],
      minSearchTermLength: 3,
      supportHighlight: false,
    });

    expect(results.length).toBe(mockData.length);
  });

  it('should add highlights when supportHighlight is enabled', () => {
    const results = service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: true,
      fuseJsHighlightKey: 'highlighted',
    });

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0];
    expect(firstResult.highlighted).toBeDefined();
    expect(firstResult.highlighted?.title).toContain('<em>');
  });

  it('should use custom highlight tag', () => {
    const results = service.searchList(mockData, 'Clean', {
      keys: ['title'],
      supportHighlight: true,
      highlightTag: 'mark',
      fuseJsHighlightKey: 'highlighted',
    });

    const result = results[0];
    const highlighted = result.highlighted;
    expect(highlighted?.title).toContain('<mark>');
    expect(highlighted?.title).toContain('</mark>');
  });

  it('should include score when requested', () => {
    const results = service.searchList(mockData, 'Pragmatic', {
      keys: ['title'],
      supportHighlight: true,
      includeScore: true,
      fuseJsScoreKey: 'score',
    });

    const result = results[0];
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe('number');
  });

  it('should filter by maximum score', () => {
    const results = service.searchList(mockData, 'xyz', {
      keys: ['title'],
      supportHighlight: true,
      maximumScore: 0.3,
      includeScore: true,
    });

    // Should filter out results with score > 0.3
    results.forEach(result => {
      if (result.fuseJsScore !== undefined) {
        expect(result.fuseJsScore).toBeLessThanOrEqual(0.3);
      }
    });
  });

  it('should handle empty list', () => {
    const results = service.searchList([], 'test', {
      keys: ['title'],
      supportHighlight: false,
    });

    expect(results).toEqual([]);
  });

  it('should not mutate original data', () => {
    const originalData = JSON.parse(JSON.stringify(mockData));

    service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: true,
    });

    expect(mockData).toEqual(originalData);
  });

  it('should use default highlight key when not specified', () => {
    const results = service.searchList(mockData, 'Clean', {
      keys: ['title'],
      supportHighlight: true,
    });

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0];
    expect(firstResult.fuseJsHighlighted).toBeDefined();
    expect(firstResult.fuseJsHighlighted?.title).toContain('<em>');
  });

  it('should search across multiple keys', () => {
    const results = service.searchList(mockData, 'Martin', {
      keys: ['title', 'author'],
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].author).toContain('Martin');
  });

  it('should handle threshold option', () => {
    const strictResults = service.searchList(mockData, 'Javasript', {
      keys: ['title'],
      threshold: 0.1,
      supportHighlight: false,
    });

    const lenientResults = service.searchList(mockData, 'Javasript', {
      keys: ['title'],
      threshold: 0.6,
      supportHighlight: false,
    });

    expect(lenientResults.length).toBeGreaterThan(strictResults.length);
  });

  it('should return empty results when no matches found', () => {
    const results = service.searchList(mockData, 'xyz123notfound', {
      keys: ['title', 'author'],
      supportHighlight: false,
    });

    expect(results).toEqual([]);
  });

  it('should highlight matches in multiple fields', () => {
    const results = service.searchList(mockData, 'Pro', {
      keys: ['title', 'author'],
      supportHighlight: true,
    });

    expect(results.length).toBeGreaterThan(0);
    const result = results[0];
    expect(result.fuseJsHighlighted).toBeDefined();
    // Should have highlight in either title or author
    const hasHighlight = result.fuseJsHighlighted?.title?.includes('<em>') || result.fuseJsHighlighted?.author?.includes('<em>');
    expect(hasHighlight).toBe(true);
  });

  it('should handle minSearchTermLength correctly', () => {
    const resultsShort = service.searchList(mockData, 'ab', {
      keys: ['title'],
      minSearchTermLength: 3,
      supportHighlight: false,
    });

    const resultsLong = service.searchList(mockData, 'Code', {
      keys: ['title'],
      minSearchTermLength: 3,
      supportHighlight: false,
    });

    // Short term should return all items (no filtering)
    expect(resultsShort.length).toBe(mockData.length);
    // Long-term should return filtered results
    expect(resultsLong.length).toBeLessThan(mockData.length);
  });

  it('should work with location and distance options', () => {
    const results = service.searchList(mockData, 'Good', {
      keys: ['title'],
      location: 0,
      distance: 100,
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle minMatchCharLength option', () => {
    const results = service.searchList(mockData, 'The', {
      keys: ['title'],
      minMatchCharLength: 2,
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
  });

  it('should use default fuseJsScoreKey when not specified', () => {
    const results = service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: true,
      includeScore: true,
    });

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0];
    expect(firstResult.fuseJsScore).toBeDefined();
    expect(typeof firstResult.fuseJsScore).toBe('number');
    expect(firstResult.fuseJsScore).toBeGreaterThanOrEqual(0);
    expect(firstResult.fuseJsScore).toBeLessThanOrEqual(1);
  });

  it('should return all items when search term is empty', () => {
    const results = service.searchList(mockData, '', {
      keys: ['title'],
      supportHighlight: true,
    });

    expect(results.length).toBe(mockData.length);
  });

  it('should handle null search term', () => {
    const results = service.searchList(mockData, null as unknown as string, {
      keys: ['title'],
      supportHighlight: false,
    });

    expect(results.length).toBe(mockData.length);
  });
});
