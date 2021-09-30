import { Injectable } from '@angular/core';
import Fuse from 'fuse.js';

import {set as _set} from 'lodash-es';
import {get as _get} from 'lodash-es';

import IFuseOptions = Fuse.IFuseOptions;

export interface AngularFuseJsOptions<T> extends IFuseOptions<T> {
  supportHighlight?: boolean;
  fuseJsHighlightKey?: string;
  fuseJsScoreKey?: string;
  minSearchTermLength?: number; // = 0;
  maximumScore?: number;
  highlightTag?: string;
}

@Injectable()
export class AngularFuseJsService<T> {
  public defaultOptions: AngularFuseJsOptions<T> = {
    supportHighlight: true,
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    minMatchCharLength: 2,
    includeScore: true,
    minSearchTermLength: 3,
    fuseJsHighlightKey: 'fuseJsHighlighted',
    fuseJsScoreKey: 'fuseJsScore',
  };

  public searchList(list: Array<T>, searchTerms: string, options: AngularFuseJsOptions<T> = {}) {
    const fuseOptions: AngularFuseJsOptions<T> = Object.assign({}, this.defaultOptions, options);
    let result: any = [];

    if (searchTerms && searchTerms.length >= (fuseOptions?.minSearchTermLength || 0)) {
      if (fuseOptions.supportHighlight) {
        fuseOptions.includeMatches = true;
      }

      let fuse = new Fuse(list, fuseOptions);
      result = fuse.search(searchTerms);
      if (fuseOptions.supportHighlight) {
        result = this._handleHighlight(result, fuseOptions);
      }
    } else {
      result = this._deepClone(list);
      if (fuseOptions.supportHighlight) {
        result.forEach((element: any) => {
          element[fuseOptions.fuseJsHighlightKey || '_'] = this._deepClone(element);
        });
      }
    }

    return result;
  }

  private _deepClone(o: any) {
    let _out: any, v, _key: string;
    _out = Array.isArray(o) ? [] : {};
    for (_key in o) {
      v = o[_key];
      _out[_key] = (typeof v === "object") ? this._deepClone(v) : v;
    }
    return _out;
  }

  private _handleHighlight(result: any, options: AngularFuseJsOptions<T>) {
    if (options.maximumScore && options.includeScore) {
      result = result.filter((matchObject: any) => {
        return matchObject.score <= (options.maximumScore || 0);
      })
    }

    return result.map((matchObject: any) => {
      const item = this._deepClone(matchObject.item);
      item[options.fuseJsHighlightKey || "_"] = this._deepClone(item);
      item[options.fuseJsScoreKey || "_"] = matchObject.score;
      for (let match of matchObject.matches) {
        const indices: number[][] = match.indices;

        let highlightOffset: number = 0;

        let key: string = match.key;
        if (_get(item[options.fuseJsHighlightKey || "_"], key).constructor === Array) {
          key += `[${match.arrayIndex}]`
        }

        for (let indice of indices) {
          let initialValue: string = _get(item[options.fuseJsHighlightKey || "_"], key) as string;

          const startOffset = indice[0] + highlightOffset;
          const endOffset = indice[1] + highlightOffset + 1;
          const tagStart = "<" + (options.highlightTag ?? "em") + ">";
          const tagEnd = "</" + (options.highlightTag ?? "em") + ">";
          let highlightedTerm = initialValue.substring(startOffset, endOffset);
          let newValue = initialValue.substring(0, startOffset) + tagStart + highlightedTerm + tagEnd + initialValue.substring(endOffset);
          highlightOffset += (tagStart + tagEnd).length;
          _set(item[options.fuseJsHighlightKey || "_"], key, newValue);
        }
      }

      return item;
    });
  }
}
