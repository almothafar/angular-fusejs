# Angular fuse.js

Angular module using [fuse.js](http://fusejs.io/) to fuzzy-search through a list of objects.
Also, easily **highlight** matched terms which is the true added value of this module.

###Forked and Revamped by Al-Mothafar for Angular 10+,

Demo: <https://almothafar.github.io/angular-fusejs/>

## How to install?

This module is available through npm. It is compatible with module bundlers (webpack / browserify ...).

1. `# npm install @almothafar/angular-fusejs`


2. Import `AngularFuseJsModule` into your module:
```
import { AngularFuseJsModule } from '@almothafar/angular-fusejs'
@NgModule({
  imports: [
    ...
    AngularFuseJsModule,
  ],
  ...
})
```

## How to use?

### Filter elements in a *ngFor
Use `fuseJs` pipe in a *ngFor to search through a list of elements. Pass search string as first parameter. Pass fusejs option object as second parameter (optional):
```
<li *ngFor="let element of (listOfElement | fuseJs:searchString:{keys: ['name', 'author']})"></li>
```

Params:
- Array(required): Array of objects to search in
- String(optional): search string
- Object(optional): options (see below)

#### Options
Supports all fusejs options (see <http://fusejs.io/>) and also those:
- **supportHighlight** (boolean), defaults to true: Whether to include highlight info in returning object. If set to false, it will just call FuseJS search, without any additional processing.
- **minSearchTermLength** (number), defaults to 3: Minimal search string length. If length is less than this value, FuseJS will not be called.
- **fuseJsHighlightKey** (string), defaults to 'fuseJsHighlighted': Key under which the highlighted results will be stored in the objects of the array. You probably do not need to change this.
- **fuseJsScoreKey** (string), defaults to 'fuseJsHighlighted': Key under which the fuse.js returned score will be stored in the objects of the array. You probably do not need to change this.

By default, here are the options set by angular-fusejs:
```
{
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
}
```

You can override those default options by injecting `AngularFuseJsService` in your app and setting `AngularFuseJsService.defaultOptions` to whatever you want.

### Show highlighted terms
```
{{element.fuseJsHighlighted.whateverAttribute}}
```
Replace `whateverAttribute` with your attribute name, trust it as HTML and you are good to go.

## Disclaimer

I made this just for fun, to learn a bit more about fuzzy search + angular. Fuzzy search + detecting what should be highlighted is 100% handled by [fuse.js](http://fusejs.io/).

If you encounter any bug, please check who is the culprit before submitting an issue - it might be a bug in fuse.js library.
