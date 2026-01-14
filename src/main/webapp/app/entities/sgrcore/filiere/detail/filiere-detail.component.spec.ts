import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { FiliereDetailComponent } from './filiere-detail.component';

describe('Filiere Management Detail Component', () => {
  let comp: FiliereDetailComponent;
  let fixture: ComponentFixture<FiliereDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiliereDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./filiere-detail.component').then(m => m.FiliereDetailComponent),
              resolve: { filiere: () => of({ id: 26666 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(FiliereDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FiliereDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load filiere on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', FiliereDetailComponent);

      // THEN
      expect(instance.filiere()).toEqual(expect.objectContaining({ id: 26666 }));
    });
  });

  describe('PreviousState', () => {
    it('should navigate to previous state', () => {
      jest.spyOn(window.history, 'back');
      comp.previousState();
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
