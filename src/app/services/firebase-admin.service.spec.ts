import { TestBed } from '@angular/core/testing';

import { FirebaseAdminService } from './firebase-admin.service';

describe('FirebaseAdminService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: FirebaseAdminService = TestBed.get(FirebaseAdminService);
    expect(service).toBeTruthy();
  });
});
