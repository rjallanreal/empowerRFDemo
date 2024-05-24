import { TestBed } from '@angular/core/testing';

import { RadioFrequencyService } from './radio-frequency.service';

describe('RadioFrequencyService', () => {
  let service: RadioFrequencyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RadioFrequencyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
