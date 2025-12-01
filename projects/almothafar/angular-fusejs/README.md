# Angular FuseJS

Modern Angular integration for [Fuse.js](https://fusejs.io/) with built-in highlighting support.

## Features

- 🚀 **Modern Angular** - Built for Angular 21+ with standalone components
- 🔍 **Fuzzy Search** - Powered by Fuse.js
- ✨ **Highlight Support** - Automatically highlight matched terms
- 🎯 **Type Safe** - Full TypeScript support
- 🪶 **Lightweight** - Zero dependencies (except Angular & Fuse.js)
- 📦 **Tree Shakeable** - Optimized bundle size

## Installation

```bash
npm install @almothafar/angular-fusejs fuse.js
```

## Usage

### Service

```typescript
import { Component, inject } from '@angular/core';
import { AngularFuseJsService } from '@almothafar/angular-fusejs';

@Component({
  selector: 'app-search',
  template: `
    <input [(ngModel)]="searchTerm" placeholder="Search...">
    <div *ngFor="let book of searchResults">
      <h3 [innerHTML]="book.fuseJsHighlighted.title"></h3>
      <p>Score: {{ book.fuseJsScore }}</p>
    </div>
  `
})
export class SearchComponent {
  private fuseService = inject(AngularFuseJsService);

  books = [
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { title: 'Clean Code', author: 'Robert Martin' }
  ];

  searchTerm = '';
  searchResults: any[] = [];

  ngOnInit() {
    this.search();
  }

  search() {
    this.searchResults = this.fuseService.searchList(
      this.books,
      this.searchTerm,
      {
        keys: ['title', 'author'],
        supportHighlight: true,
        threshold: 0.3
      }
    );
  }
}
```

### Pipe

```typescript
import { Component } from '@angular/core';
import { AngularFuseJsPipe } from '@almothafar/angular-fusejs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [AngularFuseJsPipe, FormsModule],
  template: `
    <input [(ngModel)]="searchTerm" placeholder="Search...">
    <div *ngFor="let book of books | fuseJsSearch: searchTerm : searchOptions">
      <h3 [innerHTML]="book.fuseJsHighlighted?.title || book.title"></h3>
      <p>{{ book.author }}</p>
    </div>
  `
})
export class SearchComponent {
  books = [
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford' },
    { title: 'Clean Code', author: 'Robert Martin' }
  ];

  searchTerm = '';

  searchOptions = {
    keys: ['title', 'author'],
    supportHighlight: true,
    threshold: 0.3
  };
}
```

## Options

All [Fuse.js options](https://fusejs.io/api/options.html) are supported, plus:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `supportHighlight` | `boolean` | `true` | Enable search result highlighting |
| `fuseJsHighlightKey` | `string` | `'fuseJsHighlighted'` | Key for highlighted results |
| `fuseJsScoreKey` | `string` | `'fuseJsScore'` | Key for match score |
| `minSearchTermLength` | `number` | `3` | Minimum search term length |
| `maximumScore` | `number` | `undefined` | Maximum score threshold |
| `highlightTag` | `string` | `'em'` | HTML tag for highlighting |

## Migration from v2.x

**Breaking Changes:**

1. **Angular Version**: Requires Angular 21+ (use v2.x for Angular 14)
2. **Standalone**: Library is now fully standalone
3. **No Module**: No need to import `AngularFuseJsModule`
4. **Import Changes**: Import service/pipe directly

**Before (v2.x):**
```typescript
import { AngularFuseJsModule } from '@almothafar/angular-fusejs';

@NgModule({
  imports: [AngularFuseJsModule]
})
```

**After (v3.x):**
```typescript
import { AngularFuseJsService, AngularFuseJsPipe } from '@almothafar/angular-fusejs';

@Component({
  imports: [AngularFuseJsPipe] // if using pipe
})
```

## License

MIT © [Jalal Almothafar](https://jalal.dev)
