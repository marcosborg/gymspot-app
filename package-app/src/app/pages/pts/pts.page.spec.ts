import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PtsPage } from './pts.page';

describe('PtsPage', () => {
  let component: PtsPage;
  let fixture: ComponentFixture<PtsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PtsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
