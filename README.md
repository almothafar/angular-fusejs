<div style="text-align: center;">

# 🔍 Angular FuseJS

### Modern Fuzzy Search for Angular

[![npm version](https://badge.fury.io/js/@almothafar%2Fangular-fusejs.svg)](https://www.npmjs.com/package/@almothafar/angular-fusejs)
[![npm downloads](https://img.shields.io/npm/dm/@almothafar/angular-fusejs.svg)](https://www.npmjs.com/package/@almothafar/angular-fusejs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Angular](https://img.shields.io/badge/Angular-20+-red.svg)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_it_now!-success.svg)](https://almothafar.github.io/angular-fusejs/)

Powerful fuzzy search for Angular applications with automatic highlighting, built on [Fuse.js](https://fusejs.io/)

[🚀 **Try Live Demo**](https://almothafar.github.io/angular-fusejs/) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Examples](#examples)

</div>

---

## Features

- 🚀 **Modern Angular** - Built for Angular 20+ (LTS) with standalone components
- 🔍 **Fuzzy Search** - Powered by Fuse.js
- ✨ **Highlight Support** - Automatically highlight matched terms
- 🎯 **Type Safe** - Full TypeScript support
- 🪶 **Lightweight** - Zero dependencies (except Angular & Fuse.js)
- 📦 **Tree Shakeable** - Optimized bundle size

## Installation

```bash
npm install @almothafar/angular-fusejs fuse.js
```

## Quick Start

```typescript
import {Component} from '@angular/core';
import {AngularFuseJsPipe} from '@almothafar/angular-fusejs';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search',
  imports: [AngularFuseJsPipe, FormsModule],
  template: `
    <input [(ngModel)]="searchTerm" placeholder="Search books...">
    <div *ngFor="let book of books | fuseJsSearch: searchTerm : { keys: ['title', 'author'], supportHighlight: true }">
      <h3 [innerHTML]="book.fuseJsHighlighted?.title || book.title"></h3>
      <p>{{ book.author }}</p>
    </div>
  `
})
export class SearchComponent {
  books = [
    {title: 'JavaScript: The Good Parts', author: 'Douglas Crockford'},
    {title: 'Clean Code', author: 'Robert Martin'},
    {title: 'The Pragmatic Programmer', author: 'Hunt and Thomas'}
  ];

  searchTerm = '';
}
```

## Documentation

For complete documentation, examples, and API reference, see the [library README](./projects/almothafar/angular-fusejs/README.md).

## Demo

Run the demo application locally:

```bash
# Install dependencies
npm install

# Serve demo app (automatically uses local library)
npm start
```

Navigate to `http://localhost:4200/` to see the library in action!

## Examples

### Basic Search with Highlighting

```typescript
import { Component } from '@angular/core';
import { AngularFuseJsPipe } from '@almothafar/angular-fusejs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-book-search',
  imports: [CommonModule, FormsModule, AngularFuseJsPipe],
  template: `
    <div class="search-container">
      <input
        [(ngModel)]="searchQuery"
        placeholder="Search books..."
        class="search-input"
      >

      <div class="results">
        <div
          *ngFor="let book of books | fuseJsSearch: searchQuery : searchOptions"
          class="book-card"
        >
          <h3 [innerHTML]="book.fuseJsHighlighted?.title || book.title"></h3>
          <p class="author" [innerHTML]="book.fuseJsHighlighted?.author || book.author"></p>
          <span class="score">Match: {{ (1 - (book.fuseJsScore || 0)) * 100 | number:'1.0-0' }}%</span>
        </div>
      </div>
    </div>
  `
})
export class BookSearchComponent {
  searchQuery = '';

  books = [
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', year: 2008 },
    { title: 'Clean Code', author: 'Robert C. Martin', year: 2008 },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt', year: 1999 },
    { title: 'Design Patterns', author: 'Gang of Four', year: 1994 }
  ];

  searchOptions = {
    keys: ['title', 'author'],
    supportHighlight: true,
    threshold: 0.4,
    minSearchTermLength: 2
  };
}
```

### Using the Service Directly

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { AngularFuseJsService } from '@almothafar/angular-fusejs';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-advanced-search',
  template: `
    <input [formControl]="searchControl" placeholder="Type to search...">

    <div *ngFor="let item of results">
      <h4 [innerHTML]="item.fuseJsHighlighted.name"></h4>
      <small>Relevance: {{ (1 - item.fuseJsScore) * 100 }}%</small>
    </div>
  `
})
export class AdvancedSearchComponent implements OnInit {
  private fuseService = inject(AngularFuseJsService);

  searchControl = new FormControl('');
  results: any[] = [];

  data = [
    { name: 'Angular Framework', description: 'Web application framework' },
    { name: 'React Library', description: 'JavaScript library for UI' },
    { name: 'Vue.js', description: 'Progressive JavaScript framework' }
  ];

  ngOnInit() {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.results = this.fuseService.searchList(
        this.data,
        searchTerm || '',
        {
          keys: ['name', 'description'],
          supportHighlight: true,
          threshold: 0.3,
          maximumScore: 0.6  // Only show good matches
        }
      );
    });
  }
}
```

## Development

### Build Library

```bash
npm run build
```

### Build for Production

```bash
npm run build:prod
```

### Run Tests

```bash
npm test
```

### Test Local Changes in Demo

The demo app automatically uses the local library via TypeScript path mapping. Just run:

```bash
npm start
```

Any changes you make to the library will require a rebuild:

```bash
npm run build
# Then restart the demo
```

### Testing Your Changes

Before publishing, always test your changes:

1. **Build the library:**
   ```bash
   npm run build
   ```

2. **Run unit tests:**
   ```bash
   npm run test
   ```

3. **Test in the demo app:**
   ```bash
   # The demo automatically uses the local built library
   npm start
   # Visit http://localhost:4200 and test the functionality
   ```

4. **Check for TypeScript errors:**
   ```bash
   npx ng build @almothafar/angular-fusejs --configuration production
   ```

## Migration from v2.x

Version 3.0.0 is a complete rewrite for Angular 20+ (LTS). See the [migration guide](./projects/almothafar/angular-fusejs/README.md#migration-from-v2x) for breaking changes.

For older Angular versions (14 to "Until it breaks"), use version 2.x:
```bash
npm install @almothafar/angular-fusejs@2.1.0
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Al-Mothafar Al-Hasan](https://almothafar.com)

## Support

- 🐛 [Report Bug](https://github.com/almothafar/angular-fusejs/issues)
- 💡 [Request Feature](https://github.com/almothafar/angular-fusejs/issues)
- ⭐ Star this repo if you find it helpful!
- ♥️ Consider buying me a coffee!

---

Made with ❤️ by [Al-Mothafar Al-Hasan](https://almothafar.com)
