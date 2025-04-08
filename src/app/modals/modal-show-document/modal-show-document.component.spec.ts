import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalShowDocumentComponent } from './modal-show-document.component';

describe('ModalShowDocumentComponent', () => {
  let component: ModalShowDocumentComponent;
  let fixture: ComponentFixture<ModalShowDocumentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModalShowDocumentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalShowDocumentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
