import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IMatiere } from '../matiere.model';
import { MatiereService } from '../service/matiere.service';
import { MatiereFormGroup, MatiereFormService } from './matiere-form.service';

@Component({
  selector: 'jhi-matiere-update',
  templateUrl: './matiere-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class MatiereUpdateComponent implements OnInit {
  isSaving = false;
  matiere: IMatiere | null = null;

  protected matiereService = inject(MatiereService);
  protected matiereFormService = inject(MatiereFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: MatiereFormGroup = this.matiereFormService.createMatiereFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ matiere }) => {
      this.matiere = matiere;
      if (matiere) {
        this.updateForm(matiere);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const matiere = this.matiereFormService.getMatiere(this.editForm);
    if (matiere.id !== null) {
      this.subscribeToSaveResponse(this.matiereService.update(matiere));
    } else {
      this.subscribeToSaveResponse(this.matiereService.create(matiere));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IMatiere>>): void {
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

  protected updateForm(matiere: IMatiere): void {
    this.matiere = matiere;
    this.matiereFormService.resetForm(this.editForm, matiere);
  }
}
