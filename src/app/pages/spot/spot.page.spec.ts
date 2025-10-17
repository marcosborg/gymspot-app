import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpotPage } from './spot.page';

describe('SpotPage', () => {
  let component: SpotPage;
  let fixture: ComponentFixture<SpotPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SpotPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
