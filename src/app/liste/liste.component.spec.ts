import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ListeComponent } from './liste.component';

describe('ListeComponent', () => {
  let component: ListeComponent;
  let fixture: ComponentFixture<ListeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ListeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
