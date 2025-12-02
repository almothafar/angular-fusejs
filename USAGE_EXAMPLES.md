# Usage Examples

## Basic Usage with Default Keys

```typescript
import { AngularFuseJsService } from '@almothafar/angular-fusejs';

const service = new AngularFuseJsService<Book>();

// Default keys: fuseJsHighlighted and fuseJsScore
const results = service.searchList(books, 'search term', {
  keys: ['title', 'author'],
  supportHighlight: true,
});

// Type-safe access with default keys
results[0].fuseJsHighlighted?.title; // ✅ Type-safe
results[0].fuseJsScore; // ✅ Type-safe
```

## Type-Safe Custom Keys (NEW!)

### Using `as const` for Literal Type Inference

```typescript
import { AngularFuseJsService } from '@almothafar/angular-fusejs';

const service = new AngularFuseJsService<Book>();

// Use 'as const' to preserve literal types
const results = service.searchList(books, 'search term', {
  keys: ['title', 'author'],
  supportHighlight: true,
  fuseJsHighlightKey: 'highlighted',
  fuseJsScoreKey: 'score',
} as const);

// ✅ Type-safe access with custom keys
results[0].highlighted?.title; // Works!
results[0].score; // Works!

// ❌ TypeScript error - wrong key
// results[0].banana; // Error: Property 'banana' does not exist
```

### Explicit Type Declaration

```typescript
import { AngularFuseJsService, AngularFuseJsResult } from '@almothafar/angular-fusejs';

interface Book {
  title: string;
  author: string;
}

// Declare the custom keys explicitly using the generic parameters
type BookSearchResult = AngularFuseJsResult<Book, 'highlighted', 'matchScore'>;

const service = new AngularFuseJsService<Book>();

const results: BookSearchResult[] = service.searchList(books, 'search', {
  keys: ['title'],
  supportHighlight: true,
  fuseJsHighlightKey: 'highlighted',
  fuseJsScoreKey: 'matchScore',
} as const);

// ✅ Full type safety
results[0].highlighted?.title;
results[0].matchScore;
```

## Angular Component Example

```typescript
import { Component, signal, computed } from '@angular/core';
import { AngularFuseJsService, AngularFuseJsResult } from '@almothafar/angular-fusejs';

interface Book {
  title: string;
  author: string;
}

type BookResult = AngularFuseJsResult<Book, 'highlighted', 'score'>;

@Component({
  selector: 'app-search',
  template: `
    <input [(ngModel)]="searchTerm" />

    @for (book of searchResults(); track book.title) {
      <div>
        <h3 [innerHTML]="book.highlighted?.title || book.title"></h3>
        <p>{{ book.author }}</p>
        <small>Score: {{ book.score }}</small>
      </div>
    }
  `,
})
export class SearchComponent {
  private fuseService = new AngularFuseJsService<Book>();

  searchTerm = signal('');
  books = signal<Book[]>([/* ... */]);

  searchResults = computed<BookResult[]>(() => {
    return this.fuseService.searchList(this.books(), this.searchTerm(), {
      keys: ['title', 'author'],
      supportHighlight: true,
      fuseJsHighlightKey: 'highlighted',
      fuseJsScoreKey: 'score',
    } as const);
  });
}
```

## Using the Pipe with Custom Keys

```typescript
import { Component } from '@angular/core';
import { AngularFuseJsPipe } from '@almothafar/angular-fusejs';

@Component({
  selector: 'app-books',
  imports: [AngularFuseJsPipe],
  template: `
    <input [(ngModel)]="searchTerm" />

    @for (book of books | fuseJsSearch: searchTerm : searchOptions; track book.title) {
      <div [innerHTML]="book.highlighted?.title || book.title"></div>
    }
  `,
})
export class BooksComponent {
  searchTerm = '';
  books = [/* ... */];

  // Define options with 'as const' for type inference
  searchOptions = {
    keys: ['title', 'author'],
    supportHighlight: true,
    fuseJsHighlightKey: 'highlighted',
    fuseJsScoreKey: 'score',
  } as const;
}
```

## Why Use `as const`?

Without `as const`, TypeScript treats string values as type `string`:

```typescript
// ❌ Without 'as const'
const options = {
  fuseJsHighlightKey: 'highlighted', // Type: string
};
// Results will have type: AngularFuseJsResultWithKeys<T, string, string>
// Not useful for type safety!

// ✅ With 'as const'
const options = {
  fuseJsHighlightKey: 'highlighted', // Type: 'highlighted' (literal)
} as const;
// Results will have type: AngularFuseJsResultWithKeys<T, 'highlighted', 'fuseJsScore'>
// Now you get autocomplete for result.highlighted!
```

## Key Benefits

1. **Type Safety**: TypeScript knows exactly which properties exist
2. **Autocomplete**: Your IDE will suggest the correct property names
3. **Refactoring**: Renaming keys will show TypeScript errors
4. **No Magic Strings**: Access properties directly, not via `result['stringKey']`
