import { Component } from '@angular/core';
import { AngularFuseJsOptions } from '@almothafar/angular-fusejs';
import { AppService, Book } from './app.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>Angular-fusejs</h1>
      <p>
        This demo will search with book Title or Author, try it
        <input type="search" class="form-control" [(ngModel)]="searchTerms" placeholder="Enter search terms here">
      </p>
      <table class="table">
        <thead>
        <tr>
          <th>Title</th>
          <th>Author</th>
          <th>Score</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let book of (books | fuseJs:searchTerms:searchOptions)">
          <td [innerHTML]="book.fuseJsHighlighted.title"></td>
          <td [innerHTML]="book.fuseJsHighlighted.author"></td>
          <td [innerHTML]="book.fuseJsScore"></td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public searchTerms: string = '';
  public searchOptions: AngularFuseJsOptions<Object>;
  public books: Array<Book> = [];


  constructor(private _appService: AppService) {
    this.searchOptions = {
      keys: ['title', 'author'],
      maximumScore: 0.5,
    };

    this._appService.getBooks().pipe(take(1)).subscribe(books => this.books = books);
  }

}
