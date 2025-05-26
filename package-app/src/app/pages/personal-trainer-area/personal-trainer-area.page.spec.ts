import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PersonalTrainerAreaPage } from './personal-trainer-area.page';

describe('PersonalTrainerAreaPage', () => {
  let component: PersonalTrainerAreaPage;
  let fixture: ComponentFixture<PersonalTrainerAreaPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PersonalTrainerAreaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
