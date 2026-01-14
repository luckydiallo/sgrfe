import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IFiliere, NewFiliere } from '../filiere.model';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IFiliere for edit and NewFiliereFormGroupInput for create.
 */
type FiliereFormGroupInput = IFiliere | PartialWithRequiredKeyOf<NewFiliere>;

type FiliereFormDefaults = Pick<NewFiliere, 'id'>;

type FiliereFormGroupContent = {
  id: FormControl<IFiliere['id'] | NewFiliere['id']>;
  nomFiliere: FormControl<IFiliere['nomFiliere']>;
};

export type FiliereFormGroup = FormGroup<FiliereFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class FiliereFormService {
  createFiliereFormGroup(filiere: FiliereFormGroupInput = { id: null }): FiliereFormGroup {
    const filiereRawValue = {
      ...this.getFormDefaults(),
      ...filiere,
    };
    return new FormGroup<FiliereFormGroupContent>({
      id: new FormControl(
        { value: filiereRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      nomFiliere: new FormControl(filiereRawValue.nomFiliere),
    });
  }

  getFiliere(form: FiliereFormGroup): IFiliere | NewFiliere {
    return form.getRawValue() as IFiliere | NewFiliere;
  }

  resetForm(form: FiliereFormGroup, filiere: FiliereFormGroupInput): void {
    const filiereRawValue = { ...this.getFormDefaults(), ...filiere };
    form.reset(
      {
        ...filiereRawValue,
        id: { value: filiereRawValue.id, disabled: true },
      } as any /* cast to workaround https://github.com/angular/angular/issues/46458 */,
    );
  }

  private getFormDefaults(): FiliereFormDefaults {
    return {
      id: null,
    };
  }
}
