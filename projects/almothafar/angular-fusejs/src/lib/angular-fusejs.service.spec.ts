import { TestBed } from '@angular/core/testing';

import { AngularFuseJsService } from './angular-fusejs.service';

describe('AngularFusejsService', () => {
  let service: AngularFuseJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AngularFuseJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
