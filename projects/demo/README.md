# Angular FuseJS Demo

Live demonstration of [@almothafar/angular-fusejs](https://www.npmjs.com/package/@almothafar/angular-fusejs) - a fuzzy search library for Angular applications.

## 🚀 [Try Live Demo](https://almothafar.github.io/angular-fusejs/)

## Features Demonstrated

- **Fuzzy Search** - Search through programming books by title, author, or year
- **Real-time Highlighting** - Matched text is automatically highlighted
- **Match Scoring** - See relevance scores for each result
- **Angular Signals** - Built with modern Angular signals and computed values
- **Type Safety** - Full TypeScript type safety throughout

## Running Locally

```bash
# Install dependencies
npm install

# Start the demo (from project root)
npm start

# Or run directly
npx ng serve demo
```

Navigate to `http://localhost:4200/` to see it in action!

## How It Works

The demo showcases the library's capabilities using a collection of classic programming books:

```typescript
import { AngularFuseJsService, AngularFuseJsResult } from '@almothafar/angular-fusejs';

// Initialize the service
private fuseService = new AngularFuseJsService<Book>();

// Use computed signals for reactive search
searchResults = computed<BookResult[]>(() => {
  return this.fuseService.searchList(
    this.books(),
    this.searchTerm(),
    {
      keys: ['title', 'author', 'year'],
      supportHighlight: true,
      threshold: 0.4,
      minSearchTermLength: 2,
      includeScore: true
    }
  );
});
```

## Try These Searches

- **"javascript"** - Find JS-related books
- **"martin"** - Search by author
- **"2008"** - Find books by year
- **"pragmatic"** - Fuzzy matching in titles

## Built With

- [Angular 21+](https://angular.dev/) - Modern Angular with signals
- [@almothafar/angular-fusejs](https://www.npmjs.com/package/@almothafar/angular-fusejs) - Fuzzy search library
- [Fuse.js](https://fusejs.io/) - Lightweight fuzzy-search engine

## Learn More

- [Library Documentation](../almothafar/angular-fusejs/README.md)
- [GitHub Repository](https://github.com/almothafar/angular-fusejs)
- [npm Package](https://www.npmjs.com/package/@almothafar/angular-fusejs)

## License

MIT © [Al-Mothafar Al-Hasan](https://almothafar.com)
