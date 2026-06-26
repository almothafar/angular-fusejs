import { Routes } from '@angular/router';

// Each data source is a hash route (e.g. #/books, #/open-library) so a refresh or
// bookmark keeps the active tab. The routes are componentless — App owns the whole
// UI and just reads the :sourceId segment to pick the active source.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'books' },
  { path: ':sourceId', children: [] },
  // Any other shape (unknown / multi-segment) — App normalizes it back to the default.
  { path: '**', children: [] },
];
