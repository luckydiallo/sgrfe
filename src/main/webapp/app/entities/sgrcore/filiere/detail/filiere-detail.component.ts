import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { IFiliere } from '../filiere.model';

@Component({
  selector: 'jhi-filiere-detail',
  templateUrl: './filiere-detail.component.html',
  imports: [SharedModule, RouterModule],
})
export class FiliereDetailComponent {
  filiere = input<IFiliere | null>(null);

  previousState(): void {
    window.history.back();
  }
}
