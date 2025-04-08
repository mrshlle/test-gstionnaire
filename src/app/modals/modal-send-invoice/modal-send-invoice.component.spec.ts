import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSendInvoiceComponent } from './modal-send-invoice.component';

describe('ModalSendInvoiceComponent', () => {
  let component: ModalSendInvoiceComponent;
  let fixture: ComponentFixture<ModalSendInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalSendInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalSendInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
