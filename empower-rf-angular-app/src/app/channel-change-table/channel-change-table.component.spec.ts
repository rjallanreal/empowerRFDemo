import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChannelChangeTableComponent } from './channel-change-table.component';

describe('ChannelChangeTableComponent', () => {
  let component: ChannelChangeTableComponent;
  let fixture: ComponentFixture<ChannelChangeTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChannelChangeTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ChannelChangeTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
