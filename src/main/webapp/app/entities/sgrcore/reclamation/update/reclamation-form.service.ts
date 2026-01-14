import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { IReclamation, NewReclamation } from '../reclamation.model';
import { AccountService } from 'app/core/auth/account.service';

/**
 * A partial Type with required key is used as form input.
 */
type PartialWithRequiredKeyOf<T extends { id: unknown }> = Partial<Omit<T, 'id'>> & { id: T['id'] };

/**
 * Type for createFormGroup and resetForm argument.
 * It accepts IReclamation for edit and NewReclamationFormGroupInput for create.
 */
type ReclamationFormGroupInput = IReclamation | PartialWithRequiredKeyOf<NewReclamation>;

type ReclamationFormDefaults = Pick<NewReclamation, 'id'>;

type ReclamationFormGroupContent = {
  id: FormControl<IReclamation['id'] | NewReclamation['id']>;
  nomReclamant: FormControl<IReclamation['nomReclamant']>;
  prenomReclamant: FormControl<IReclamation['prenomReclamant']>;
  niveauEtude: FormControl<IReclamation['niveauEtude']>;
  objetReclamation: FormControl<IReclamation['objetReclamation']>;
  motifReclamation: FormControl<IReclamation['motifReclamation']>;
  justificatif: FormControl<IReclamation['justificatif']>;
  justificatifContentType: FormControl<IReclamation['justificatifContentType']>;
  etatReclamation: FormControl<IReclamation['etatReclamation']>;
  noteActuelle: FormControl<IReclamation['noteActuelle']>;
  noteCorrige: FormControl<IReclamation['noteCorrige']>;
  contactProfesseur: FormControl<IReclamation['contactProfesseur']>;
  filiere: FormControl<IReclamation['filiere']>;
  matiere: FormControl<IReclamation['matiere']>;
  etudiant: FormControl<IReclamation['etudiant']>;
  professeur: FormControl<IReclamation['professeur']>;
};

export type ReclamationFormGroup = FormGroup<ReclamationFormGroupContent>;

@Injectable({ providedIn: 'root' })
export class ReclamationFormService {
  protected accountService = inject(AccountService);

  createReclamationFormGroup(
    reclamation: ReclamationFormGroupInput = { id: null }
  ): ReclamationFormGroup {
    const reclamationRawValue = {
      ...this.getFormDefaults(),
      ...reclamation,
    };

    const form = new FormGroup<ReclamationFormGroupContent>({
      id: new FormControl(
        { value: reclamationRawValue.id, disabled: true },
        {
          nonNullable: true,
          validators: [Validators.required],
        },
      ),
      nomReclamant: new FormControl(reclamationRawValue.nomReclamant, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),
      prenomReclamant: new FormControl(reclamationRawValue.prenomReclamant, {
        validators: [Validators.required, Validators.maxLength(150)],
      }),

      niveauEtude: new FormControl(reclamationRawValue.niveauEtude),

      objetReclamation: new FormControl(
        { value: 'Demande de révision de note', disabled: true },
        { validators: [Validators.required] }
      ),

      motifReclamation: new FormControl(reclamationRawValue.motifReclamation, {
        validators: [Validators.required],
      }),
      justificatif: new FormControl(reclamationRawValue.justificatif),
      justificatifContentType: new FormControl(reclamationRawValue.justificatifContentType),
      etatReclamation: new FormControl(reclamationRawValue.etatReclamation),
      noteActuelle: new FormControl(reclamationRawValue.noteActuelle, {
        validators: [Validators.required],
      }),
      noteCorrige: new FormControl(reclamationRawValue.noteCorrige),
      filiere: new FormControl(reclamationRawValue.filiere, {
        validators: [Validators.required],
      }),
      matiere: new FormControl(reclamationRawValue.matiere, {
        validators: [Validators.required],
      }),
      etudiant: new FormControl(reclamationRawValue.etudiant, {
        validators: [Validators.required],
      }),
      professeur: new FormControl(reclamationRawValue.professeur, {
        validators: [Validators.required],
      }),

      contactProfesseur: new FormControl(reclamationRawValue.contactProfesseur,  {
        validators: [Validators.pattern(/^(\+226\s?)?[67]\d{7}$/)],
      }),
    });

    // Désactivation conditionnelle après récupération du profil
    this.accountService.identity().subscribe(account => {
      if (account?.profile === 'ETUDIANT') {
        form.get('noteCorrige')?.disable();
      }
    });

    return form;
  }

  getReclamation(form: ReclamationFormGroup): IReclamation | NewReclamation {
    return form.getRawValue() as IReclamation | NewReclamation;
  }

  resetForm(form: ReclamationFormGroup, reclamation: ReclamationFormGroupInput): void {
    const reclamationRawValue = { ...this.getFormDefaults(), ...reclamation };

    form.reset({
      ...reclamationRawValue,
      id: { value: reclamationRawValue.id, disabled: true },
    } as any);
  }

  private getFormDefaults(): ReclamationFormDefaults {
    return {
      id: null,
    };
  }
}
