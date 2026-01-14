import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IFiliere } from '../filiere.model';
import { FiliereService } from '../service/filiere.service';
import { FiliereFormGroup, FiliereFormService } from './filiere-form.service';

@Component({
  selector: 'jhi-filiere-update',
  templateUrl: './filiere-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FiliereUpdateComponent implements OnInit {
  isSaving = false;
  filiere: IFiliere | null = null;

  protected filiereService = inject(FiliereService);
  protected filiereFormService = inject(FiliereFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FiliereFormGroup = this.filiereFormService.createFiliereFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ filiere }) => {
      this.filiere = filiere;
      if (filiere) {
        this.updateForm(filiere);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const filiere = this.filiereFormService.getFiliere(this.editForm);
    if (filiere.id !== null) {
      this.subscribeToSaveResponse(this.filiereService.update(filiere));
    } else {
      this.subscribeToSaveResponse(this.filiereService.create(filiere));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFiliere>>): void {
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

  protected updateForm(filiere: IFiliere): void {
    this.filiere = filiere;
    this.filiereFormService.resetForm(this.editForm, filiere);
  }
}
