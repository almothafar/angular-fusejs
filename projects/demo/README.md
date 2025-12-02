# Angular FuseJS Demo

Live demonstration of [@almothafar/angular-fusejs](https://www.npmjs.com/package/@almothafar/angular-fusejs) - a fuzzy search library for Angular applications.

## 🚀 [Try Live Demo](https://almothafar.github.io/angular-fusejs/)

## Features Demonstrated

- **Fuzzy Search** - Search through 260+ programming books by title, author, or year
- **Multi-language Support** - Bilingual dataset with English and Arabic books
- **Arabic Text Normalization** - Smart search that handles Arabic character variations (أ, إ, آ → ا)
- **RTL Layout** - Automatic right-to-left text direction for Arabic content
- **Real-time Highlighting** - Matched text is automatically highlighted
- **Match Scoring** - See relevance scores for each result
- **Large Dataset** - Books loaded dynamically from JSON file
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

The demo showcases the library's capabilities using a collection of 260+ programming books in English and Arabic:

### Data Loading

Books are loaded dynamically from a JSON file using Angular's HttpClient:

```typescript
ngOnInit() {
  this.http.get<Book[]>('books.json').subscribe(books => {
    this.books.set(books);
  });
}
```

### Fuzzy Search with Signals

The search is implemented using Angular signals and computed values for reactive updates:

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

### Arabic Text Normalization

The demo includes custom Arabic text normalization to handle character variations:

```typescript
private normalizeArabicText(text: string): string {
  return text
    // Normalize alef variations (أ, إ, آ → ا)
    .replace(/[أإآ]/g, 'ا')
    // Normalize ta marbuta (ة → ه)
    .replace(/ة/g, 'ه')
    // Remove Arabic diacritics (tashkeel)
    .replace(/[\u064B-\u065F]/g, '');
}
```

This allows searches to match regardless of which alef variation is used in the query or data.

### RTL Support

Arabic books are displayed with proper right-to-left layout using CSS:

```scss
.book-card[data-lang='ar'] {
  direction: rtl;

  .book-meta {
    flex-direction: row-reverse;
  }
}
```

## Try These Searches

### English
- **"javascript"** - Find JS-related books
- **"martin"** - Search by author (Robert C. Martin, Martin Fowler)
- **"2008"** - Find books by year
- **"pragmatic"** - Fuzzy matching in titles

### Arabic
- **"احمد"** or **"أحمد"** - Both will find أحمد بن يوسف السيد's books (normalization in action!)
- **"السكران"** - Find إبراهيم السكران's books
- **"القيم"** - Find classic books by ابن القيم الجوزية
- **"الغزالي"** - Find books by أبو حامد الغزالي

## Dataset Note

⚠️ The demo dataset was generated with AI assistance for demonstration purposes. While book titles and authors are matched accurately, some ISBNs may be placeholders. This large, diverse dataset effectively showcases the library's fuzzy search capabilities across multiple languages.

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
