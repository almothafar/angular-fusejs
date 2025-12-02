import { TestBed } from '@angular/core/testing';
import { AngularFuseJsPipe } from './angular-fusejs.pipe';
import { AngularFuseJsService } from './angular-fusejs.service';

interface Book {
  id: number;
  title: string;
  author: string;
}

describe('AngularFuseJsPipe', () => {
  let pipe: AngularFuseJsPipe;
  let service: AngularFuseJsService<Book>;

  const mockData: Book[] = [
    { id: 1, title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { id: 2, title: 'Clean Code', author: 'Robert Martin' },
    { id: 3, title: 'The Pragmatic Programmer', author: 'Hunt and Thomas' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AngularFuseJsPipe, AngularFuseJsService],
    });
    pipe = TestBed.inject(AngularFuseJsPipe);
    service = TestBed.inject(AngularFuseJsService);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform list with search term', () => {
    const results = pipe.transform(mockData, 'JavaScript', {
      keys: ['title'],
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('JavaScript');
  });

  it('should return empty array when list is null', () => {
    const results = pipe.transform(null, 'test', { keys: ['title'] });
    expect(results).toEqual([]);
  });

  it('should return empty array when list is undefined', () => {
    const results = pipe.transform(undefined, 'test', { keys: ['title'] });
    expect(results).toEqual([]);
  });

  it('should return empty array when list is not an array', () => {
    const results = pipe.transform({} as Book[], 'test', { keys: ['title'] });
    expect(results).toEqual([]);
  });

  it('should work with highlighting enabled', () => {
    const results = pipe.transform(mockData, 'Clean', {
      keys: ['title'],
      supportHighlight: true,
    });

    expect(results.length).toBeGreaterThan(0);
    const firstResult = results[0];
    expect(firstResult.fuseJsHighlighted).toBeDefined();
  });

  it('should work without options parameter', () => {
    const results = pipe.transform(mockData, 'Code', undefined);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should filter results based on search term', () => {
    const allResults = pipe.transform(mockData, '', { keys: ['title'] });
    const filteredResults = pipe.transform(mockData, 'JavaScript', { keys: ['title'] });

    expect(filteredResults.length).toBeLessThan(allResults.length);
  });

  it('should search across multiple keys', () => {
    const results = pipe.transform(mockData, 'Martin', {
      keys: ['title', 'author'],
      supportHighlight: false,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(results[0].author).toContain('Martin');
  });

  it('should pass through options to service', () => {
    const searchSpy = vi.spyOn(service, 'searchList');

    pipe.transform(mockData, 'test', {
      keys: ['title'],
      threshold: 0.4,
      minSearchTermLength: 2,
    });

    expect(searchSpy).toHaveBeenCalledWith(mockData, 'test', {
      keys: ['title'],
      threshold: 0.4,
      minSearchTermLength: 2,
    });
  });

  it('should handle empty search term', () => {
    const results = pipe.transform(mockData, '', {
      keys: ['title'],
      supportHighlight: false,
    });

    expect(results.length).toBe(mockData.length);
  });
});
