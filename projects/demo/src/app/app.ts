import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AngularFuseJsPipe, AngularFuseJsResult } from '@almothafar/angular-fusejs';

interface Book {
  title: string;
  author: string;
  year: number;
  isbn: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, FormsModule, AngularFuseJsPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular FuseJS Demo');

  searchTerm = signal('');

  books: Book[] = [
    { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', year: 2008, isbn: '978-0596517748' },
    { title: 'Clean Code', author: 'Robert C. Martin', year: 2008, isbn: '978-0132350884' },
    { title: 'The Pragmatic Programmer', author: 'Andrew Hunt & David Thomas', year: 1999, isbn: '978-0201616224' },
    { title: 'Design Patterns', author: 'Gang of Four', year: 1994, isbn: '978-0201633610' },
    { title: 'Refactoring', author: 'Martin Fowler', year: 1999, isbn: '978-0201485677' },
    { title: 'Code Complete', author: 'Steve McConnell', year: 2004, isbn: '978-0735619678' },
    { title: 'The Mythical Man-Month', author: 'Frederick P. Brooks Jr.', year: 1975, isbn: '978-0201835953' },
    { title: 'Structure and Interpretation of Computer Programs', author: 'Harold Abelson', year: 1984, isbn: '978-0262510875' },
    { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', year: 1990, isbn: '978-0262033844' },
    { title: 'The Art of Computer Programming', author: 'Donald Knuth', year: 1968, isbn: '978-0201896831' }
  ];

  searchOptions = {
    keys: ['title', 'author'] as const,
    supportHighlight: true,
    threshold: 0.4,
    minSearchTermLength: 2,
    includeScore: true
  };
}
