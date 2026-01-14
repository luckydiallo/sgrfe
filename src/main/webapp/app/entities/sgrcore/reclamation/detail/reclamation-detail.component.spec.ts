import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';

import { ReclamationDetailComponent } from './reclamation-detail.component';

describe('Reclamation Management Detail Component', () => {
  let comp: ReclamationDetailComponent;
  let fixture: ComponentFixture<ReclamationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReclamationDetailComponent],
      providers: [
        provideRouter(
          [
            {
              path: '**',
              loadComponent: () => import('./reclamation-detail.component').then(m => m.ReclamationDetailComponent),
              resolve: { reclamation: () => of({ id: 14154 }) },
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    })
      .overrideTemplate(ReclamationDetailComponent, '')
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReclamationDetailComponent);
    comp = fixture.componentInstance;
  });

  describe('OnInit', () => {
    it('should load reclamation on init', async () => {
      const harness = await RouterTestingHarness.create();
      const instance = await harness.navigateByUrl('/', ReclamationDetailComponent);

      // THEN
      expect(instance.reclamation()).toEqual(expect.objectContaining({ id: 14154 }));
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
