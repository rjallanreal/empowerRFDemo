import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioFrequencyDisplayComponent } from './radio-frequency-display.component';

describe('RadioFrequencyDisplayComponent', () => {
  let component: RadioFrequencyDisplayComponent;
  let fixture: ComponentFixture<RadioFrequencyDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioFrequencyDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RadioFrequencyDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
