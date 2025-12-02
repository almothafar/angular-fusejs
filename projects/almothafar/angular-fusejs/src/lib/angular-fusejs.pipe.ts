import { Pipe, PipeTransform, inject } from '@angular/core';
import { AngularFuseJsService, AngularFuseJsOptions, AngularFuseJsResult } from './angular-fusejs.service';

/**
 * Angular pipe for filtering lists with Fuse.js
 *
 * @example
 * ```html
 * <!-- Basic usage -->
 * <div *ngFor="let item of items | fuseJsSearch: searchTerm : { keys: ['name', 'email'] }">
 *   {{ item.name }}
 * </div>
 *
 * <!-- With highlighting -->
 * <div *ngFor="let item of items | fuseJsSearch: searchTerm : { keys: ['title'], supportHighlight: true }">
 *   <div [innerHTML]="item.fuseJsHighlighted.title"></div>
 * </div>
 * ```
 */
@Pipe({
  name: 'fuseJsSearch',
  standalone: true,
})
export class AngularFuseJsPipe implements PipeTransform {
  private fuseJsService = inject(AngularFuseJsService);

  /**
   * Transform array using Fuse.js search
   *
   * @param list - Array to search through
   * @param searchTerms - Search query
   * @param options - Fuse.js options
   * @returns Filtered array with optional highlighting
   */
  transform<T>(list: T[] | null | undefined, searchTerms: string, options?: AngularFuseJsOptions<T>): AngularFuseJsResult<T>[] {
    if (!list || !Array.isArray(list)) {
      return [];
    }

    return this.fuseJsService.searchList(list, searchTerms, options);
  }
}
