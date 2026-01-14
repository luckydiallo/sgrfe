import { TestBed } from '@angular/core/testing';

import { sampleWithNewData, sampleWithRequiredData } from '../filiere.test-samples';

import { FiliereFormService } from './filiere-form.service';

describe('Filiere Form Service', () => {
  let service: FiliereFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FiliereFormService);
  });

  describe('Service methods', () => {
    describe('createFiliereFormGroup', () => {
      it('should create a new form with FormControl', () => {
        const formGroup = service.createFiliereFormGroup();

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nomFiliere: expect.any(Object),
          }),
        );
      });

      it('passing IFiliere should create a new form with FormGroup', () => {
        const formGroup = service.createFiliereFormGroup(sampleWithRequiredData);

        expect(formGroup.controls).toEqual(
          expect.objectContaining({
            id: expect.any(Object),
            nomFiliere: expect.any(Object),
          }),
        );
      });
    });

    describe('getFiliere', () => {
      it('should return NewFiliere for default Filiere initial value', () => {
        const formGroup = service.createFiliereFormGroup(sampleWithNewData);

        const filiere = service.getFiliere(formGroup) as any;

        expect(filiere).toMatchObject(sampleWithNewData);
      });

      it('should return NewFiliere for empty Filiere initial value', () => {
        const formGroup = service.createFiliereFormGroup();

        const filiere = service.getFiliere(formGroup) as any;

        expect(filiere).toMatchObject({});
      });

      it('should return IFiliere', () => {
        const formGroup = service.createFiliereFormGroup(sampleWithRequiredData);

        const filiere = service.getFiliere(formGroup) as any;

        expect(filiere).toMatchObject(sampleWithRequiredData);
      });
    });

    describe('resetForm', () => {
      it('passing IFiliere should not enable id FormControl', () => {
        const formGroup = service.createFiliereFormGroup();
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, sampleWithRequiredData);

        expect(formGroup.controls.id.disabled).toBe(true);
      });

      it('passing NewFiliere should disable id FormControl', () => {
        const formGroup = service.createFiliereFormGroup(sampleWithRequiredData);
        expect(formGroup.controls.id.disabled).toBe(true);

        service.resetForm(formGroup, { id: null });

        expect(formGroup.controls.id.disabled).toBe(true);
      });
    });
  });
});
