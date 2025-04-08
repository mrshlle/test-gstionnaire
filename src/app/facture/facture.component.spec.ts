import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FactureComponent } from './facture.component';

describe('FactureComponent', () => {
  let component: FactureComponent;
  let fixture: ComponentFixture<FactureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FactureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
