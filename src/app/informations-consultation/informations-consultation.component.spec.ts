import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { InformationsConsultationComponent } from './informations-consultation.component';

describe('InformationsConsultationComponent', () => {
  let component: InformationsConsultationComponent;
  let fixture: ComponentFixture<InformationsConsultationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ InformationsConsultationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformationsConsultationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
