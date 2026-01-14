import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IMatiere } from '../matiere.model';

@Component({
  selector: 'jhi-matiere-detail',
  templateUrl: './matiere-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class MatiereDetailComponent {
  matiere = input<IMatiere | null>(null);

  previousState(): void {
    window.history.back();
  }
}
