import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IFiliere } from 'app/entities/sgrcore/filiere/filiere.model';
import { FiliereService } from 'app/entities/sgrcore/filiere/service/filiere.service';
import { IMatiere } from 'app/entities/sgrcore/matiere/matiere.model';
import { MatiereService } from 'app/entities/sgrcore/matiere/service/matiere.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { ReclamationService } from '../service/reclamation.service';
import { IReclamation } from '../reclamation.model';
import { ReclamationFormGroup, ReclamationFormService } from './reclamation-form.service';
import { AccountService } from 'app/core/auth/account.service';
import { Account } from 'app/core/auth/account.model';


@Component({
  selector: 'jhi-reclamation-update',
  templateUrl: './reclamation-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class ReclamationUpdateComponent implements OnInit {
  isSaving = false;
  isScolarite = false;
  isProfesseur = false;
  reclamation: IReclamation | null = null;

  filieresSharedCollection: IFiliere[] = [];
  matieresSharedCollection: IMatiere[] = [];
  usersSharedCollection: IUser[] = [];
  professeursSharedCollection: IUser[] = [];


  protected reclamationService = inject(ReclamationService);
  protected reclamationFormService = inject(ReclamationFormService);
  protected filiereService = inject(FiliereService);
  protected matiereService = inject(MatiereService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);
  protected accountService = inject(AccountService);


  niveauxEtude = [
    'Licence 1',
    'Licence 2',
    'Licence 3',
    'Master 1',
    'Master 2',
  ];

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: ReclamationFormGroup = this.reclamationFormService.createReclamationFormGroup();

  compareFiliere = (o1: IFiliere | null, o2: IFiliere | null): boolean => this.filiereService.compareFiliere(o1, o2);

  compareMatiere = (o1: IMatiere | null, o2: IMatiere | null): boolean => this.matiereService.compareMatiere(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);



  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ reclamation }) => {
      this.reclamation = reclamation;
      if (reclamation) {
        this.updateForm(reclamation);
      }
      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const reclamation = this.reclamationFormService.getReclamation(this.editForm);
    if (reclamation.id !== null) {
      this.subscribeToSaveResponse(this.reclamationService.update(reclamation));
    } else {
      this.subscribeToSaveResponse(this.reclamationService.create(reclamation));
    }
  }

  setJustificatif(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    // Vérification basique
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.editForm.patchValue({
        justificatif: base64,
        justificatifContentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  }


  protected subscribeToSaveResponse(result: Observable<HttpResponse<IReclamation>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(reclamation: IReclamation): void {
    this.reclamation = reclamation;
    this.reclamationFormService.resetForm(this.editForm, reclamation);

    this.filieresSharedCollection = this.filiereService.addFiliereToCollectionIfMissing<IFiliere>(
      this.filieresSharedCollection,
      reclamation.filiere,
    );
    this.matieresSharedCollection = this.matiereService.addMatiereToCollectionIfMissing<IMatiere>(
      this.matieresSharedCollection,
      reclamation.matiere,
    );
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, reclamation.etudiant);

    this.professeursSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.professeursSharedCollection, reclamation.professeur);
  }

  protected loadRelationshipsOptions(): void {
   this.filiereService
    .query()
    .pipe(map(res => res.body ?? []))
    .subscribe(filieres => {
      this.filieresSharedCollection = filieres;

      this.prefillFromConnectedUser();
    });


    this.matiereService
      .query()
      .pipe(map((res: HttpResponse<IMatiere[]>) => res.body ?? []))
      .pipe(
        map((matieres: IMatiere[]) => this.matiereService.addMatiereToCollectionIfMissing<IMatiere>(matieres, this.reclamation?.matiere)),
      )
      .subscribe((matieres: IMatiere[]) => (this.matieresSharedCollection = matieres));

    this.userService
      .queryProfesseurs() // endpoint dédié
      .pipe(map(res => res.body ?? []))
      .pipe(map(professeurs => this.userService.addUserToCollectionIfMissing<IUser>( professeurs, this.reclamation?.professeur)))
      .subscribe(professeurs => {
        this.professeursSharedCollection = professeurs;
        console.log("professeursSharedCollection dans le typeScript", this.professeursSharedCollection)
      });

  }

  protected prefillFromConnectedUser(): void {
  this.accountService.identity().subscribe(account => {
     this.isScolarite = account?.profile === 'SCOLARITE';
     this.isProfesseur = account?.profile === 'PROFESSEUR';
    if (!account) {
      return;
    }

    // 1. Champs texte
    this.editForm.patchValue({
      nomReclamant: account.lastName,
      prenomReclamant: account.firstName,
    });

    if (account.niveauEtude) {
      this.editForm.patchValue({
        niveauEtude: account.niveauEtude,
      });
    }

    // 2. Filière
    const userFiliere = this.filieresSharedCollection.find(
      filiere => filiere.id === account.filiereId
    );

    if (userFiliere) {
      this.editForm.patchValue({ filiere: userFiliere });

      this.filieresSharedCollection =
        this.filiereService.addFiliereToCollectionIfMissing(
          this.filieresSharedCollection,
          userFiliere
        );
    }

    // 3. User connecté
    this.editForm.patchValue({
      etudiant: {
        id: account.id!,
        login: account.login,
      },
    });

    this.usersSharedCollection =
      this.userService.addUserToCollectionIfMissing(
        this.usersSharedCollection,
        { id: account.id!, login: account.login }
      );
  });
}


}
