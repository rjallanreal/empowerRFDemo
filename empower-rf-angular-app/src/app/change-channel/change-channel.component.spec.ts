import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeChannelComponent } from './change-channel.component';

describe('ChangeChannelComponent', () => {
  let component: ChangeChannelComponent;
  let fixture: ComponentFixture<ChangeChannelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangeChannelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChangeChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
