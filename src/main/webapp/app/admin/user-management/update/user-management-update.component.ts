import { Component, OnInit, signal, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';


import { IUser, UserFormValue, UserProfile } from 'app/entities/user/user.model';
import { UserManagementService } from '../service/user-management.service';
import { EntityArrayResponseType, FiliereService } from 'app/entities/sgrcore/filiere/service/filiere.service';
import { MatiereService } from 'app/entities/sgrcore/matiere/service/matiere.service';
import SharedModule from 'app/shared/shared.module';
import { IFiliere } from 'app/entities/sgrcore/filiere/filiere.model';
import { IMatiere } from 'app/entities/sgrcore/matiere/matiere.model';
import { RegisterService } from 'app/account/register/register.service';
import PasswordStrengthBarComponent from 'app/account/password/password-strength-bar/password-strength-bar.component';

const userTemplate = {} as IUser;

// const newUser: IUser = {
//   activated: true,
// } as IUser;

const NEW_USER_FORM: UserFormValue = {
  id: null,
  login: '',
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  profile: 'ETUDIANT',
  niveauEtude: null,
  filiereId: null,
  matiereIds: null,
  activated: true,
  // authorities: [],
};



@Component({
  selector: 'jhi-user-mgmt-update',
  templateUrl: './user-management-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule, PasswordStrengthBarComponent],
})
export default class UserManagementUpdateComponent implements OnInit {
  // ===== Services =====
  private readonly userService = inject(UserManagementService);
  private readonly filiereService = inject(FiliereService);
  private readonly matiereService = inject(MatiereService);
  private readonly route = inject(ActivatedRoute);
  private readonly registerService = inject(RegisterService);
 

  // ===== UI State =====
  // authorities = signal<string[]>([]);
  isSaving = signal(false);

  doNotMatch = signal(false);
  error = signal(false);
  errorEmailExists = signal(false);
  errorUserExists = signal(false);
  success = signal(false);

  // ===== Données dynamiques =====
  filieres = signal<IFiliere[]>([]);
  matieres = signal<IMatiere[]>([]);

  niveauxEtude = [
    'Licence 1',
    'Licence 2',
    'Licence 3',
    'Master 1',
    'Master 2',
  ];

  // ===== Formulaire =====
  editForm = new FormGroup({
    id: new FormControl(userTemplate.id),

    login: new FormControl(userTemplate.login, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
        Validators.pattern(
          '^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$'
        ),
      ],
    }),

    email: new FormControl(userTemplate.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(5), Validators.maxLength(254), Validators.email],
    }),

    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),

    confirmPassword: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(50)],
    }),

    firstName: new FormControl(userTemplate.firstName, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),

    lastName: new FormControl(userTemplate.lastName, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)],
    }),

    profile: new FormControl<UserProfile>(
      (userTemplate.profile as UserProfile) ?? 'ETUDIANT',
      { nonNullable: true, validators: Validators.required }
    ),


    // Champs métier
    niveauEtude: new FormControl<string | null>(null),
    filiereId: new FormControl<number | null>(null),
    matiereIds: new FormControl<number[] | null>(null),

    // Champs admin
    activated: new FormControl(userTemplate.activated, { nonNullable: true }),
    // authorities: new FormControl(userTemplate.authorities, { nonNullable: true }),
  });

  // ===== Lifecycle =====
  ngOnInit(): void {
    this.route.data.subscribe(({ user }) => {
      if (user) {
        this.editForm.reset(user);
      } else {
        this.editForm.reset(NEW_USER_FORM);
      }
    });

    // this.userService.authorities().subscribe(auths => this.authorities.set(auths));

    this.loadFilieres();
    this.loadMatieres();

    this.editForm.get('profile')!.valueChanges.subscribe(profile =>
      this.applyProfileRules(profile)
    );
  }

  // ===== Chargement données métier =====
  loadFilieres(): void {
    this.filiereService.query().subscribe({
      next: (res: EntityArrayResponseType) => res.body && this.filieres.set(res.body),
      error: err => console.error('Erreur chargement filières', err),
    });
  }

  loadMatieres(): void {
    this.matiereService.query().subscribe({
      next: (res: EntityArrayResponseType) => res.body && this.matieres.set(res.body),
      error: err => console.error('Erreur chargement matières', err),
    });
  }

  // ===== Règles dynamiques profil =====
  private applyProfileRules(profile: string): void {
    const niveauEtude = this.editForm.get('niveauEtude')!;
    const filiereId = this.editForm.get('filiereId')!;
    const matiereIds = this.editForm.get('matiereIds')!;

    niveauEtude.reset();
    filiereId.reset();
    matiereIds.reset();

    niveauEtude.clearValidators();
    filiereId.clearValidators();
    matiereIds.clearValidators();

    if (profile === 'ETUDIANT') {
      niveauEtude.setValidators(Validators.required);
      filiereId.setValidators(Validators.required);
    }

    if (profile === 'PROFESSEUR') {
      matiereIds.setValidators(Validators.required);
    }

    niveauEtude.updateValueAndValidity();
    filiereId.updateValueAndValidity();
    matiereIds.updateValueAndValidity();
  }

  // ===== Navigation =====
  previousState(): void {
    window.history.back();
  }

  // ===== Save =====
  save(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorEmailExists.set(false);
    this.errorUserExists.set(false);

    const { password, confirmPassword } = this.editForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
      return;
    }

    this.isSaving.set(true);

    const { confirmPassword: _, ...user } = this.editForm.getRawValue();

    const request$ = user.id
      ? this.userService.update(user)
      : this.userService.create({ ...user, langKey: 'fr' });

    request$.subscribe({
      next: () => this.onSaveSuccess(),
      error: err => this.processError(err),
    });
  }

  private onSaveSuccess(): void {
    this.isSaving.set(false);
    this.success.set(true);
    this.previousState();
  }

  private processError(response: HttpErrorResponse): void {
    this.isSaving.set(false);

    if (response.status === 400 && response.error?.type === 'LOGIN_ALREADY_USED') {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error?.type === 'EMAIL_ALREADY_USED') {
      this.errorEmailExists.set(true);
    } else {
      this.error.set(true);
    }
  }
}
