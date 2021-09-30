import { Pipe, PipeTransform } from '@angular/core';
import { AngularFuseJsOptions, AngularFuseJsService } from './angular-fusejs.service';


@Pipe({name: 'fuseJs'})
export class AngularFuseJsPipe<T> implements PipeTransform {
  constructor(
    private _fuseJsService: AngularFuseJsService<T>
  ) {}

  transform(elements: Array<T>,
            searchTerms: string,
            options: AngularFuseJsOptions<T> = {}) {
    return this._fuseJsService.searchList(elements, searchTerms, options);
  }
}
