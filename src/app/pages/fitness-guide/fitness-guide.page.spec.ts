import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FitnessGuidePage } from './fitness-guide.page';

describe('FitnessGuidePage', () => {
  let component: FitnessGuidePage;
  let fixture: ComponentFixture<FitnessGuidePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(FitnessGuidePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
