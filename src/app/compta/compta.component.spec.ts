import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ComptaComponent } from './compta.component';

describe('ComptaComponent', () => {
  let component: ComptaComponent;
  let fixture: ComponentFixture<ComptaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ComptaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComptaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
