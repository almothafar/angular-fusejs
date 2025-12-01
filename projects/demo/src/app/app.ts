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
        includeScore: true
      }
    );
  });
}
