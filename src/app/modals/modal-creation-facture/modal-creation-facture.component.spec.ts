import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ModalCreationFactureComponent } from './modal-creation-facture.component';

describe('ModalCreationFactureComponent', () => {
  let component: ModalCreationFactureComponent;
  let fixture: ComponentFixture<ModalCreationFactureComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalCreationFactureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalCreationFactureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
