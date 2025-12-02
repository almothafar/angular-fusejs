import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularFuseJsPipe, AngularFuseJsResult, AngularFuseJsService } from '@almothafar/angular-fusejs';

interface Book {
  title: string;
  author: string;
  year: number;
  isbn: string;
  language: 'en' | 'ar';
}

type BookResult = AngularFuseJsResult<Book>;

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private fuseService = new AngularFuseJsService<Book>();

  protected readonly title = signal('Angular FuseJS Demo');

  searchTerm = signal('');
  books = signal<Book[]>([]);

  ngOnInit() {
    this.http.get<Book[]>('books.json').subscribe(books => {
      this.books.set(books);
    });
  }

  /**
   * Normalizes Arabic text for better fuzzy search matching
   * - Converts alef variations (أ, إ, آ) to plain alef (ا)
   * - Converts ta marbuta (ة) to ha (ه)
   * - Removes Arabic diacritics (tashkeel)
   */
  private normalizeArabicText(text: string): string {
    return text
      // Normalize alef variations
      .replace(/[أإآ]/g, 'ا')
      // Normalize ta marbuta to ha
      .replace(/ة/g, 'ه')
      // Remove Arabic diacritics (tashkeel)
      .replace(/[\u064B-\u065F]/g, '');
  }

  // Computed signal that returns properly typed search results
  searchResults = computed<BookResult[]>(() => {
    return this.fuseService.searchList(
      this.books(),
      this.searchTerm(),
      {
        keys: ['title', 'author', 'year'],
        supportHighlight: true,
        threshold: 0.4,
        minSearchTermLength: 2,
        includeScore: true,
        // Custom getFn to normalize Arabic text before searching
        getFn: (obj: Book, path: string | string[]) => {
          const keys = Array.isArray(path) ? path : [path];
          const value = keys.reduce((acc: any, key) => acc?.[key], obj as any);
          const stringValue = String(value ?? '');
          return this.normalizeArabicText(stringValue);
        }
      }
    );
  });
}
