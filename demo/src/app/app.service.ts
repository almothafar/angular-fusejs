import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface Book {
  author: string;
  country: string;
  imageLink: string;
  language: string;
  link: string;
  pages: number;
  title: string;
  year: number;
}

@Injectable()
export class AppService {
  constructor(private _http: HttpClient) {
  }

  public getBooks(): Observable<Book[]> {
    return this._http.get<Book[]>('./assets/books.json');
  }
}
