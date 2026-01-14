import { AfterViewInit, Component, ElementRef, inject, OnInit, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import { EMAIL_ALREADY_USED_TYPE, LOGIN_ALREADY_USED_TYPE } from 'app/config/error.constants';
import SharedModule from 'app/shared/shared.module';
import PasswordStrengthBarComponent from '../password/password-strength-bar/password-strength-bar.component';
import { RegisterService } from './register.service';
import { EntityArrayResponseType, FiliereService } from 'app/entities/sgrcore/filiere/service/filiere.service';
import { IFiliere } from 'app/entities/sgrcore/filiere/filiere.model';
import { MatiereService } from 'app/entities/sgrcore/matiere/service/matiere.service';
import { IMatiere } from 'app/entities/sgrcore/matiere/matiere.model';

@Component({
  selector: 'jhi-register',
  imports: [SharedModule, RouterModule, FormsModule, ReactiveFormsModule, PasswordStrengthBarComponent],
  templateUrl: './register.component.html',
})
export default class RegisterComponent implements AfterViewInit, OnInit {
  
  login = viewChild.required<ElementRef>('login');

  protected readonly filiereService = inject(FiliereService);
  protected readonly matiereService = inject(MatiereService);
  
  doNotMatch = signal(false);
  error = signal(false);
  errorEmailExists = signal(false);
  errorUserExists = signal(false);
  success = signal(false);

  // données dynamiques
  filieres = signal<IFiliere[]>([]);
  matieres = signal<IMatiere[]>([]);

  niveauxEtude = [
    'Licence 1',
    'Licence 2',
    'Licence 3',
    'Master 1',
    'Master 2',
  ];

  registerForm = new FormGroup({
    login: new FormControl('', {
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
    email: new FormControl('', {
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

    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),

    profile: new FormControl<'ETUDIANT' | 'PROFESSEUR' | 'SCOLARITE' | 'DIRECTEUR'>(
      'ETUDIANT',
      { nonNullable: true, validators: Validators.required }
    ),

    // spécifiques
    niveauEtude: new FormControl<string | null>(null),
    filiereId: new FormControl<number | null>(null),
    matiereIds: new FormControl<number[] | null>(null),
  });

  private readonly registerService = inject(RegisterService);
  // private readonly profileService = inject(ProfileService);

  ngOnInit(): void {
      this.loadFilieres();
      this.loadMatieres();
    }

  ngAfterViewInit(): void {
    this.login().nativeElement.focus();
    this.registerForm.get('profile')!.valueChanges.subscribe(profile =>
      this.applyProfileRules(profile)
    );
  }

  loadFilieres(): void {
  this.filiereService.query().subscribe({
    next: (res: EntityArrayResponseType) => {
      // On vérifie si le body existe avant de l'assigner
      if (res.body) {
        this.filieres.set(res.body);
      }
    },
    error: (err) => console.error('Erreur lors du chargement des filières', err),
  });
}


 loadMatieres(): void {
  this.matiereService.query().subscribe({
    next: (res: EntityArrayResponseType) => {
      // On vérifie si le body existe avant de l'assigner
      if (res.body) {
        this.matieres.set(res.body);
      }
    },
    error: (err) => console.error('Erreur lors du chargement des matières', err),
  });
}

  private applyProfileRules(profile: string): void {
    const niveauEtude = this.registerForm.get('niveauEtude')!;
    const filiereId = this.registerForm.get('filiereId')!;
    const matiereIds = this.registerForm.get('matiereIds')!;

    // reset
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


  register(): void {
    this.doNotMatch.set(false);
    this.error.set(false);
    this.errorEmailExists.set(false);
    this.errorUserExists.set(false);

    const { password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.doNotMatch.set(true);
      return;
    }

    const {
      confirmPassword: _,
      ...payload
    } = this.registerForm.getRawValue();

    this.registerService.save({
      ...payload,
      langKey: 'fr',
    }).subscribe({
      next: () => this.success.set(true),
      error: response => this.processError(response),
    });
  }

  private processError(response: HttpErrorResponse): void {
    if (response.status === 400 && response.error.type === 'LOGIN_ALREADY_USED') {
      this.errorUserExists.set(true);
    } else if (response.status === 400 && response.error.type === 'EMAIL_ALREADY_USED') {
      this.errorEmailExists.set(true);
    } else {
      this.error.set(true);
    }
  }
}
