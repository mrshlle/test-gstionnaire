import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModificationComponent } from './modification.component';

describe('ModificationComponent', () => {
  let component: ModificationComponent;
  let fixture: ComponentFixture<ModificationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
