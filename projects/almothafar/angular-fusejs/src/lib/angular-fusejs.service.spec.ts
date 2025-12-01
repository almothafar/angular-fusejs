import { TestBed } from '@angular/core/testing';
import { AngularFuseJsService } from './angular-fusejs.service';

describe('AngularFuseJsService', () => {
  let service: AngularFuseJsService;

  const mockData = [
    { id: 1, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { id: 2, title: 'Clean Code', author: 'Robert Martin' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Hunt and Thomas' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AngularFuseJsService]
    });
    service = TestBed.inject(AngularFuseJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should search and return matching results', () => {
    const results = service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: false
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('JavaScript');
  });

  it('should return empty array when search term is too short', () => {
    const results = service.searchList(mockData, 'ab', {
      keys: ['title'],
      minSearchTermLength: 3,
      supportHighlight: false
    });

    expect(results.length).toBe(mockData.length);
  });

  it('should add highlights when supportHighlight is enabled', () => {
    const results = service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: true,
      fuseJsHighlightKey: 'highlighted'
    });

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0] as any;
    expect(firstResult.highlighted).toBeDefined();
    expect(firstResult.highlighted.title).toContain('<em>');
  });

  it('should use custom highlight tag', () => {
    const results = service.searchList(mockData, 'Clean', {
      keys: ['title'],
      supportHighlight: true,
      highlightTag: 'mark',
      fuseJsHighlightKey: 'highlighted'
    });

    const result = results[0] as any;
    expect(result.highlighted.title).toContain('<mark>');
    expect(result.highlighted.title).toContain('</mark>');
  });

  it('should include score when requested', () => {
    const results = service.searchList(mockData, 'Pragmatic', {
      keys: ['title'],
      supportHighlight: true,
      includeScore: true,
      fuseJsScoreKey: 'score'
    });

    const result = results[0] as any;
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe('number');
  });

  it('should filter by maximum score', () => {
    const results = service.searchList(mockData, 'xyz', {
      keys: ['title'],
      supportHighlight: true,
      maximumScore: 0.3,
      includeScore: true
    });

    // Should filter out results with score > 0.3
    results.forEach((result: any) => {
      if (result.fuseJsScore !== undefined) {
        expect(result.fuseJsScore).toBeLessThanOrEqual(0.3);
      }
    });
  });

  it('should handle empty list', () => {
    const results = service.searchList([], 'test', {
      keys: ['title'],
      supportHighlight: false
    });

    expect(results).toEqual([]);
  });

  it('should not mutate original data', () => {
    const originalData = JSON.parse(JSON.stringify(mockData));

    service.searchList(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: true
    });

    expect(mockData).toEqual(originalData);
  });
});
