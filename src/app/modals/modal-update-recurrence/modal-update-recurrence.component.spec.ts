import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalUpdateRecurrenceComponent } from './modal-update-recurrence.component';

describe('ModalUpdateRecurrenceComponent', () => {
  let component: ModalUpdateRecurrenceComponent;
  let fixture: ComponentFixture<ModalUpdateRecurrenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalUpdateRecurrenceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalUpdateRecurrenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
